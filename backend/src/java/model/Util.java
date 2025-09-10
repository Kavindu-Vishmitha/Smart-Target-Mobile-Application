package model;

public class Util {
    
    public static boolean isEmailValid(String email){
        
        return email.matches("^[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook|gov|live)\\.(com|lk|edu\\.lk|ac\\.lk|gov\\.lk|sch\\.lk|org\\.lk|net|in)$");
        
    }
    
    public static boolean isPasswordValid(String password){
        
        return password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=]).{8,}$");
        
    }
       
}

