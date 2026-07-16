package com.herwaycabs.payment.controller;

import com.herwaycabs.payment.model.Payment;
import com.herwaycabs.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<Payment> createOrder(
            @RequestParam Long rideId,
            @RequestParam Long riderId,
            @RequestParam Double amount) {
        try {
            return ResponseEntity.ok(paymentService.createOrder(rideId, riderId, amount));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Payment> verifyPayment(@RequestBody Map<String, String> data) {
        String orderId = data.get("razorpayOrderId");
        String paymentId = data.get("razorpayPaymentId");
        String signature = data.get("razorpaySignature");
        return ResponseEntity.ok(paymentService.verifyPayment(orderId, paymentId, signature));
    }
}
