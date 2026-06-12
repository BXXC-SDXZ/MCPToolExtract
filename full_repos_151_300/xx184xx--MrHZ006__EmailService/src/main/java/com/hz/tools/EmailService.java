package com.hz.tools;

import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.util.Properties;
@Service
public class EmailService {

    private static final Properties props = new Properties();
    private static final String HOST = "smtp.qq.com";
    @Value("${qq.username}")
    private   String USERNAME;
    @Value("${qq.password}")
    private  String PASSWORD ;
    private static final String SENDER_NAME = "AI GeManus";

    static {
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", HOST);
        props.put("mail.smtp.port", "587");
    }

    @Tool(description = "Send an email message to a recipient")
    public String sendEmail(
            @ToolParam(description = "Recipient email address") String toEmail,
            @ToolParam(description = "Subject of the email") String subject,
            @ToolParam(description = "Content of the email message") String messageContent
        ) {

        try {
            // 验证邮箱格式
            if (!isValidEmail(toEmail)) {
                return "Error: Invalid email address format";
            }

            Session session = Session.getInstance(props, new Authenticator() {
                protected javax.mail.PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(USERNAME, PASSWORD);
                }
            });

            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(USERNAME, SENDER_NAME));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail));
            message.setSubject(subject);

            // 构建邮件内容，包含AI签名
            String fullContent = messageContent +
                    "\n\n---\n此邮件由AI GeManus自动发送" +
                    "\n若有建议，欢迎邮箱投稿：992382472@qq.com";

            message.setText(fullContent);

            Transport.send(message);
            return "Email sent successfully to: " + toEmail;

        } catch (Exception e) {
            return "Error sending email: " + e.getMessage();
        }
    }

    private boolean isValidEmail(String email) {
        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
        return email != null && email.matches(emailRegex);
    }
}
