package com.hz.tools;

import jakarta.annotation.Resource;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class EmailServiceTest {
    @Resource
    private EmailService emailService;

    @Test
    void sendEmail() {
        String s = emailService.sendEmail("2715607574@qq.com", "测试邮件主题", "测试邮件内容");
        Assertions.assertNotNull(s);
    }
}