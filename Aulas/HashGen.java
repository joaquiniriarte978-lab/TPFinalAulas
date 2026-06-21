import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class HashGen {
    public static void main(String[] args) {
        var enc = new BCryptPasswordEncoder();
        String[] passwords = {"admin123", "profe123", "alumno123"};
        for (String p : passwords) {
            System.out.println(p + " -> " + enc.encode(p));
        }
    }
}
