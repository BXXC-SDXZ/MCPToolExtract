package com.agodareviewmcp;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;


@SpringBootTest
class ReviewServiceTest {

    @Autowired
    ReviewService service;

    @Test
    void should_detect_review(){
        String reviews = service.getReviews(
                "https://www.agoda.com/ko-kr/intercontinental-bangkok-sukhumvit/hotel/bangkok-th.html?countryId=106&finalPriceView=1&isShowMobileAppPrice=false&cid=1922887&numberOfBedrooms=&familyMode=false&adults=2&children=0&rooms=1&maxRooms=0&checkIn=2025-03-5&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=KRW&isFreeOccSearch=false&tag=eeeb2a37-a3e0-4932-8325-55d6a8ba95a4&tspTypes=-1%2C-1&los=1&searchrequestid=f1a8f8e8-1dfe-4c18-93ef-688cb081e4a9&ds=QmXecXpmpuL9m2KT");

        System.out.println("reviews = " + reviews);
        Assertions
                .assertThat(reviews).isNotNull()
                .startsWith("hotel name")
                .contains("positive review", "negative review");
    }

}
