import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "regex-generator",
  slug: "regex-generator",
  description: "Test regex patterns against strings. Get all matches, capture groups, positions, and plain-English pattern explanations.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/test",
      price: "$0.001",
      description: "Test a regex pattern against input strings",
      toolName: "text_test_regex",
      toolDescription: `Use this when you need to test a regular expression against one or more strings. Returns all matches, capture groups, positions, and a human-readable explanation of the pattern.

1. pattern -- the regex pattern tested
2. flags -- flags applied (g, i, m, s, u)
3. explanation -- plain-English description of what the pattern matches
4. results -- array of test results per string, each with: matched (boolean), matches (array with value, index, groups)
5. totalMatches -- total match count across all test strings

Example output: {"pattern":"\\d{3}-\\d{4}","flags":"g","explanation":"Matches 3 digits, a hyphen, then 4 digits","results":[{"input":"Call 555-1234","matched":true,"matches":[{"value":"555-1234","index":5,"groups":[]}]}],"totalMatches":1}

Use this FOR validating regex patterns before deploying them in code, debugging why a pattern fails to match, or extracting structured data from text. Use this BEFORE writing complex regex into production code.

Do NOT use for text classification -- use text_classify_content instead. Do NOT use for PII detection -- use privacy_detect_pii instead. Do NOT use for text comparison -- use text_compare_diff instead.`,
      inputSchema: {
        type: "object",
        properties: {
          pattern: { type: "string", description: "Regular expression pattern (without delimiters)" },
          flags: { type: "string", description: "Regex flags: g, i, m, s, u (default: g)" },
          testStrings: { type: "array", items: { type: "string" }, description: "Array of strings to test against the pattern" },
        },
        required: ["pattern", "testStrings"],
      },
      outputSchema: {
          "type": "object",
          "properties": {
            "pattern": {
              "type": "string",
              "description": "Regex pattern tested"
            },
            "flags": {
              "type": "string",
              "description": "Regex flags used"
            },
            "explanation": {
              "type": "string",
              "description": "Human-readable explanation of the pattern"
            },
            "totalMatches": {
              "type": "number",
              "description": "Total matches across all inputs"
            },
            "results": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "input": {
                    "type": "string"
                  },
                  "matches": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "matchCount": {
                    "type": "number"
                  },
                  "isMatch": {
                    "type": "boolean"
                  }
                }
              }
            }
          },
          "required": [
            "pattern",
            "totalMatches",
            "results"
          ]
        },
    },
  ],
};
