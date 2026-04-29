package com.livepass.backend.checkout.model;

import com.livepass.backend.auth.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "pagbank_order_id", unique = true, nullable = false)
    private String pagbankOrderId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private Status paymentStatus;

    @Column(name = "ticket_uuid", unique = true, nullable = false)
    private UUID ticketUuid;

    @Convert(converter = com.livepass.backend.config.validation.EncryptionConverter.class)
    @Column(name = "totp_secret", length = 255) // Increased length for encrypted content
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String totpSecret;

    @Column(name = "is_used", nullable = false)
    private boolean used = false;

    @Column(name = "used_at")
    private OffsetDateTime usedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "used_by_staff")
    private User usedByStaff;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
        if (ticketUuid == null) {
            ticketUuid = UUID.randomUUID();
        }
        if (paymentStatus == null) {
            paymentStatus = Status.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public enum Status {
        PENDING, PAID, CANCELLED
    }
}
