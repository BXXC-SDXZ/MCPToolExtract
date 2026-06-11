package org.springframework.ai.mcp.sample.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class IndexController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/display-code")
    public String displayCode() {
        return "display-code";
    }
} 