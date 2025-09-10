package controller;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import hibernate.HibernateUtil;
import hibernate.Target;
import hibernate.User;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.BufferedReader;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.criterion.Restrictions;

@WebServlet(name = "DeleteMyTarget", urlPatterns = {"/DeleteMyTarget"})
public class DeleteMyTarget extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        JsonObject responseObject = new JsonObject();
        Session session = null;
        Transaction transaction = null;

        try {

            User user = (User) request.getSession().getAttribute("loggedInUser");
            if (user == null) {
                responseObject.addProperty("status", false);
                responseObject.addProperty("message", "User session expired. Please log in again.");
                response.getWriter().write(responseObject.toString());
                return;
            }

            StringBuilder sb = new StringBuilder();
            try (BufferedReader reader = request.getReader()) {
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
            }
            JsonObject jsonRequest = JsonParser.parseString(sb.toString()).getAsJsonObject();

            if (!jsonRequest.has("targetId")) {
                responseObject.addProperty("status", false);
                responseObject.addProperty("message", "Target ID is missing.");
                response.getWriter().write(responseObject.toString());
                return;
            }
            int targetId = jsonRequest.get("targetId").getAsInt();

            session = HibernateUtil.getSessionFactory().openSession();
            transaction = session.beginTransaction();

            Target targetToDelete = (Target) session.createCriteria(Target.class)
                    .add(Restrictions.eq("id", targetId))
                    .uniqueResult();

            if (targetToDelete == null) {
                responseObject.addProperty("status", false);
                responseObject.addProperty("message", "Target not found.");
                response.getWriter().write(responseObject.toString());
                return;
            }

            if (targetToDelete.getUser().getId() != user.getId()) {
                responseObject.addProperty("status", false);
                responseObject.addProperty("message", "Unauthorized access. You can only delete your own targets.");
                response.getWriter().write(responseObject.toString());
                return;
            }

            session.delete(targetToDelete);
            transaction.commit();

            responseObject.addProperty("status", true);
            responseObject.addProperty("message", "Target deleted successfully.");
            response.getWriter().write(responseObject.toString());

        } catch (NumberFormatException e) {
            if (transaction != null) {
                transaction.rollback();
            }
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Invalid Target ID format.");
            response.getWriter().write(responseObject.toString());
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            e.printStackTrace();

            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Server error: " + e.getMessage());
            response.getWriter().write(responseObject.toString());

        } finally {
            if (session != null && session.isOpen()) {
                session.close();
            }
        }
    }
}
