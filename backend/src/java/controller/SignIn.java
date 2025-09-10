package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import hibernate.HibernateUtil;
import hibernate.User;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import model.Util;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

@WebServlet(name = "SignIn", urlPatterns = {"/SignIn"})
public class SignIn extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        Gson gson = new Gson();
        JsonObject requestObject = gson.fromJson(request.getReader(), JsonObject.class);
        JsonObject responseobject = new JsonObject();

        responseobject.addProperty("status", false);
        responseobject.addProperty("message", "Login Fail");

        String email = requestObject.get("email").getAsString();
        String password = requestObject.get("password").getAsString();

        if (email.isEmpty()) {

            responseobject.addProperty("message", "Please enter email address.");

        } else if (!Util.isEmailValid(email)) {

            responseobject.addProperty("message", "Enter a valid email address.");

        } else if (password.isEmpty()) {

            responseobject.addProperty("message", "Please enter a password.");

        } else if (!Util.isPasswordValid(password)) {

            responseobject.addProperty("message", "Enter a valid password.");

        } else {

            Session s = HibernateUtil.getSessionFactory().openSession();

            Criteria c1 = s.createCriteria(User.class);
            c1.add(Restrictions.eq("email", email));
            c1.add(Restrictions.eq("password", password));

            List<User> userlist = c1.list();

            if (userlist.isEmpty()) {

                responseobject.addProperty("message", "Invalid credentials");

            } else {

                User user = userlist.get(0);
                
                request.getSession().setAttribute("loggedInUser", user);
                
                responseobject.add("loggeduser", gson.toJsonTree(user));
                responseobject.addProperty("status", true);
                responseobject.addProperty("message", "Login successful");
            }
        }

        response.setContentType("application/json");
        response.getWriter().write(gson.toJson(responseobject));
    }
}