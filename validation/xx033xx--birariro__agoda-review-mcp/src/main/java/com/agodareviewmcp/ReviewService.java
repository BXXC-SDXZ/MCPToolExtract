package com.agodareviewmcp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class ReviewService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private static final int REVIEW_COUNT = 10;
    private static final  String BASE_URL = "https://www.agoda.com/api/cronos/property/review/ReviewComments";
    private static final String RESULT_STRING_FORMAT = """
                hotel name : %s
                ## positive review
                %s
                ## negative review
                %s
                """;

    public ReviewService(ObjectProvider<ObjectMapper> provider) {
        this.objectMapper = provider.getIfAvailable(ObjectMapper::new);
        this.restClient = RestClient.builder()
                .baseUrl(BASE_URL)
                .defaultHeader("content-type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * get hotel name and review
     * @param url agoda hotel info url
     */
    @Tool(description = "Get review of the hotel. input is url (e.g. https://www.agoda.co/...)")
    public String getReviews(String url){

        String simpleUrl = convertSimpleUrl(url);
        String hotelId = fetchHotelId(simpleUrl);

        NameAndReview positiveReviews = fetchReviews(hotelId, REVIEW_TYPE.POSITIVE);
        NameAndReview negativeReviews = fetchReviews(hotelId, REVIEW_TYPE.NEGATIVE);

        return String.format(RESULT_STRING_FORMAT,
                positiveReviews.name,
                positiveReviews.review,
                negativeReviews.review);
    }

    private NameAndReview fetchReviews(String hotelId, REVIEW_TYPE reviewType) {

        Map<String, Object> payload = new HashMap<>();
        payload.put("hotelId", hotelId);
        payload.put("page", 1);
        payload.put("pageSize", REVIEW_COUNT);
        payload.put("sorting", reviewType.getValue());

        try {
            String body = restClient.post()
                    .body(objectMapper.writeValueAsString(payload))
                    .retrieve()
                    .body(String.class);

            JsonNode jsonNode = objectMapper.readTree(body);
            StringBuilder review = new StringBuilder();
            String hotelName = "";

            int i = 1;
            for (JsonNode comment : jsonNode.get("comments")) {

                hotelName = comment.get("responderName").asText();
                String reviewComments = comment.get("reviewComments").asText();

                if(StringUtils.hasText(reviewComments)){
                    review.append(i).append(". ").append(reviewComments).append("\n");
                    i ++;
                }
            }
            return new NameAndReview(hotelName,review.toString());
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse JSON response", e);
        }
    }

    private String convertSimpleUrl(String url) {
        return url.endsWith(".html") ? url : url.split("html\\?")[0] + "html";
    }

    private String fetchHotelId(String url) {
        try {
            Document document = Jsoup.connect(url).get();
            Element scriptTag = document.selectFirst("script[data-selenium=script-initparam]");

            if (scriptTag != null) {
                String scriptContent = scriptTag.html();
                Pattern pattern = Pattern.compile("hotel_id=(\\d+)");
                Matcher matcher = pattern.matcher(scriptContent);

                if (matcher.find()) {
                    return matcher.group(1);
                } else {
                    throw new RuntimeException("hotelId not found");
                }
            } else {
                throw new RuntimeException("Script tag not found");
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to fetch webpage", e);
        }
    }

    private record NameAndReview(String name, String review) {
    }

    private enum REVIEW_TYPE{
        POSITIVE(2), NEGATIVE(3);
        private final int value;

        REVIEW_TYPE(int value) {
            this.value = value;
        }

        public int getValue() {
            return value;
        }
    }
}
