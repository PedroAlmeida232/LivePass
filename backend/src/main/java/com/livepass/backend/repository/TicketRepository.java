package com.livepass.backend.repository;

import com.livepass.backend.checkout.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    Optional<Ticket> findByPagbankOrderId(String pagbankOrderId);
    Optional<Ticket> findByTicketUuid(java.util.UUID ticketUuid);
    List<Ticket> findByUserEmail(String email);
}
