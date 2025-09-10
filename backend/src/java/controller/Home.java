package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import hibernate.HibernateUtil;
import hibernate.Target;
import hibernate.User;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.hibernate.Session;
import org.hibernate.Transaction;

@WebServlet(name = "Home", urlPatterns = {"/Home"})
@MultipartConfig
public class Home extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        Gson gson = new Gson();
        JsonObject responseObject = new JsonObject();

        responseObject.addProperty("status", false);
        responseObject.addProperty("message", "Target save failed");

        try {
            String subjectName = request.getParameter("subjectName");
            String targetDateStr = request.getParameter("targetDate");
            String note = request.getParameter("note");

            if (subjectName == null || subjectName.trim().isEmpty()) {
                responseObject.addProperty("message", "Subject name is required");
            } else if (targetDateStr == null || targetDateStr.trim().isEmpty()) {
                responseObject.addProperty("message", "Target date is required");
            } else {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                Date targetDate = sdf.parse(targetDateStr);

                Date today = sdf.parse(sdf.format(new Date()));

                if (targetDate.before(today)) {
                    responseObject.addProperty("message", "Target date cannot be in the past");
                } else if (note == null || note.trim().isEmpty()) {
                    responseObject.addProperty("message", "Note is required");
                } else {
                    User user = (User) request.getSession().getAttribute("loggedInUser");

                    if (user == null) {
                        responseObject.addProperty("message", "User is not logged in");
                    } else {
                        Session session = HibernateUtil.getSessionFactory().openSession();
                        Transaction tx = session.beginTransaction();

                        User managedUser = (User) session.get(User.class, user.getId());

                        Target target = new Target();
                        target.setSubject_name(subjectName);
                        target.setTarget_date(targetDate);
                        target.setNote(note);
                        target.setUser(managedUser);

                        session.save(target);
                        tx.commit();
                        session.close();

                        responseObject.addProperty("status", true);
                        responseObject.addProperty("message", "Target saved successfully");
                        responseObject.add("savedTarget", gson.toJsonTree(target));
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            responseObject.addProperty("message", "Server error: " + e.getMessage());
        }

        response.setContentType("application/json");
        response.getWriter().write(gson.toJson(responseObject));
    }
}