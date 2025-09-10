package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet(name = "LogoutUser", urlPatterns = {"/LogoutUser"})
public class LogoutUser extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        Gson gson = new Gson();
        JsonObject responseObject = new JsonObject();
        response.setContentType("application/json");

        try {
            HttpSession session = request.getSession(false); 

            if (session != null) {
                session.invalidate();
                responseObject.addProperty("status", true);
                responseObject.addProperty("message", "Logged out successfully");
            } else {
                responseObject.addProperty("status", false);
                responseObject.addProperty("message", "No active session to log out from");
            }

        } catch (Exception e) {
            e.printStackTrace();
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Server error during logout: " + e.getMessage());
        }

        response.getWriter().write(gson.toJson(responseObject));
    }
}
