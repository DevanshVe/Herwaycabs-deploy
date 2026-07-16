package com.herwaycabs.payment.service;

import com.herwaycabs.payment.model.Payment;
import com.herwaycabs.payment.model.PaymentStatus;
import com.herwaycabs.payment.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() {
        try {
            // Check if keys are placeholders, if so, mocking might be needed or it will
            // fail on call
            if (!razorpayKeyId.contains("placeholder")) {
                this.razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            }
        } catch (RazorpayException e) {
            e.printStackTrace();
        }
    }

    public Payment createOrder(Long rideId, Long riderId, Double amount) throws RazorpayException {
        if (razorpayClient == null) {
            // Fallback for testing without keys
            return createMockOrder(rideId, riderId, amount);
        }

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", (int) (amount * 100)); // Amount in paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "ride_" + rideId);

        Order order = razorpayClient.orders.create(orderRequest);

        Payment payment = Payment.builder()
                .rideId(rideId)
                .riderId(riderId)
                .amount(amount)
                .status(PaymentStatus.PENDING)
                .razorpayOrderId(order.get("id"))
                .createdAt(LocalDateTime.now())
                .build();

        return paymentRepository.save(payment);
    }

    private Payment createMockOrder(Long rideId, Long riderId, Double amount) {
        Payment payment = Payment.builder()
                .rideId(rideId)
                .riderId(riderId)
                .amount(amount)
                .status(PaymentStatus.PENDING)
                .razorpayOrderId("order_mock_" + System.currentTimeMillis())
                .createdAt(LocalDateTime.now())
                .build();
        return paymentRepository.save(payment);
    }

    public Payment verifyPayment(String orderId, String paymentId, String signature) {
        Payment payment = paymentRepository.findByRazorpayOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment Order not found"));

        // In production, verify signature here using RazorpayUtils

        payment.setRazorpayPaymentId(paymentId);
        payment.setRazorpaySignature(signature);
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setCompletedAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }
}
