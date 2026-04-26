package com.livepass.backend.auth.controller;

import com.livepass.backend.auth.dto.LoginRequest;
import com.livepass.backend.auth.dto.RegisterRequest;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class AuthControllerIT {

    @LocalServerPort
    private Integer port;

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @BeforeEach
    void setUp() {
        RestAssured.baseURI = "http://localhost:" + port;
    }

    @Test
    void register_validPayload_returns201AndToken() {
        RegisterRequest request = RegisterRequest.builder()
                .email("it_test@example.com")
                .password("password123")
                .build();

        given()
                .contentType(ContentType.JSON)
                .body(request)
                .when()
                .post("/api/auth/register")
                .then()
                .statusCode(201)
                .body("token", notNullValue())
                .body("email", equalTo("it_test@example.com"));
    }

    @Test
    void register_duplicateEmail_returns409() {
        RegisterRequest request = RegisterRequest.builder()
                .email("duplicate@example.com")
                .password("password123")
                .build();

        // First registration
        given()
                .contentType(ContentType.JSON)
                .body(request)
                .post("/api/auth/register");

        // Second registration with same email
        given()
                .contentType(ContentType.JSON)
                .body(request)
                .when()
                .post("/api/auth/register")
                .then()
                .statusCode(409);
    }

    @Test
    void login_validCredentials_returns200AndToken() {
        String email = "login_test@example.com";
        String password = "password123";

        // Register first
        given()
                .contentType(ContentType.JSON)
                .body(RegisterRequest.builder().email(email).password(password).build())
                .post("/api/auth/register");

        LoginRequest loginRequest = LoginRequest.builder()
                .email(email)
                .password(password)
                .build();

        given()
                .contentType(ContentType.JSON)
                .body(loginRequest)
                .when()
                .post("/api/auth/login")
                .then()
                .statusCode(200)
                .body("token", notNullValue());
    }

    @Test
    void getMe_withValidToken_returnsUserData() {
        String email = "me_test@example.com";
        RegisterRequest request = RegisterRequest.builder().email(email).password("password123").build();

        String token = given()
                .contentType(ContentType.JSON)
                .body(request)
                .post("/api/auth/register")
                .then()
                .extract()
                .path("token");

        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .get("/api/auth/me")
                .then()
                .statusCode(200)
                .body("email", equalTo(email));
    }

    @Test
    void getMe_withoutToken_returns403() {
        given()
                .when()
                .get("/api/auth/me")
                .then()
                .statusCode(403);
    }
}
