package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import hibernate.HibernateUtil;
import hibernate.Target;
import hibernate.User;
import java.io.IOException;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.criterion.Restrictions;

@WebServlet(name = "MyTarget", urlPatterns = {"/MyTarget"})
public class MyTarget extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        Gson gson = new Gson();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        User user = (User) request.getSession().getAttribute("loggedInUser");

        if (user == null) {
            JsonObject responseObject = new JsonObject();
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Server session expired. Please log in again.");
            response.getWriter().write(gson.toJson(responseObject));
            return;
        }

        Session session = null;
        try {
            session = HibernateUtil.getSessionFactory().openSession();
            List<Target> targets = session.createCriteria(Target.class)
                    .add(Restrictions.eq("user.id", user.getId()))
                    .list();

            response.getWriter().write(gson.toJson(targets));

        } catch (Exception e) {
            e.printStackTrace();
            JsonObject responseObject = new JsonObject();
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Server error: " + e.getMessage());
            response.getWriter().write(gson.toJson(responseObject));
        } finally {
            if (session != null && session.isOpen()) {
                session.close();
            }
        }
    }
     
}