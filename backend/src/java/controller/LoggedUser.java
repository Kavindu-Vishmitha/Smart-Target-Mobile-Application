package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import hibernate.User;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Base64;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(name = "LoggedUser", urlPatterns = {"/LoggedUser"})
public class LoggedUser extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        Gson gson = new Gson();
        JsonObject responseObject = new JsonObject();

        responseObject.addProperty("status", false);
        responseObject.addProperty("message", "User not logged in");

        try {
            User user = (User) request.getSession().getAttribute("loggedInUser");

            if (user == null) {
                responseObject.addProperty("message", "User is not logged in");
            } else {

                String profileImageBase64 = null;
                String imagePath = getServletContext().getRealPath("") + File.separator + "profile_image" + File.separator + user.getProfile_image();
                File imageFile = new File(imagePath);

                if (imageFile.exists() && !imageFile.isDirectory()) {
                    try {
                        byte[] fileContent = Files.readAllBytes(imageFile.toPath());
                        profileImageBase64 = Base64.getEncoder().encodeToString(fileContent);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }

                JsonObject userJson = (JsonObject) gson.toJsonTree(user);
                userJson.addProperty("profile_image_base64", profileImageBase64);
                
                userJson.remove("profile_image");

                responseObject.addProperty("status", true);
                responseObject.addProperty("message", "User details fetched successfully");
                responseObject.add("user", userJson);
            }
        } catch (Exception e) {
            e.printStackTrace();
            responseObject.addProperty("message", "Server error: " + e.getMessage());
        }

        response.setContentType("application/json");
        response.getWriter().write(gson.toJson(responseObject));
    }
}