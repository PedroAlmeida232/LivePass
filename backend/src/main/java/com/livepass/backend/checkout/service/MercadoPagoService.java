package com.livepass.backend.checkout.service;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.client.payment.PaymentPayerRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class MercadoPagoService {

    @Value("${application.mercadopago.access-token}")
    private String accessToken;

    @PostConstruct
    public void init() {
        MercadoPagoConfig.setAccessToken(accessToken);
    }

    public Payment createPixPayment(String email, String firstName, String lastName, String cpf, BigDecimal amount) throws MPException, MPApiException {
        PaymentClient client = new PaymentClient();

        PaymentCreateRequest request = PaymentCreateRequest.builder()
                .transactionAmount(amount)
                .description("LivePass Ticket")
                .paymentMethodId("pix")
                .payer(PaymentPayerRequest.builder()
                        .email(email)
                        .firstName(firstName)
                        .lastName(lastName)
                        .identification(com.mercadopago.client.common.IdentificationRequest.builder()
                                .type("CPF")
                                .number(cpf)
                                .build())
                        .build())
                .build();

        return client.create(request);
    }

    public Payment getPayment(Long id) throws MPException, MPApiException {
        PaymentClient client = new PaymentClient();
        return client.get(id);
    }
}
