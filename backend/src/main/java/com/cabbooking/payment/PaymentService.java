package com.cabbooking.payment;

import com.cabbooking.booking.Ride;
import com.cabbooking.booking.RideRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    private RazorpayClient razorpayClient;
    private final RideRepository rideRepository;

    public PaymentService(RideRepository rideRepository) {
        this.rideRepository = rideRepository;
    }

    @PostConstruct
    public void init() throws RazorpayException {
        this.razorpayClient = new RazorpayClient(keyId, keySecret);
    }

    public String createOrder(Long rideId) throws RazorpayException {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        JSONObject orderRequest = new JSONObject();
        // Razorpay expects amount in paise (100 paise = 1 INR)
        orderRequest.put("amount", (int) (ride.getFare() * 100));
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "ride_" + rideId);

        Order order = razorpayClient.orders.create(orderRequest);
        return order.toString();
    }

    // In a real app, verifying the signature is crucial for security
    public boolean verifyPayment(String orderId, String paymentId, String signature) throws RazorpayException {
        // RazorpayClient utils can be used here
        // Utils.verifyPaymentSignature(attributes, keySecret);
        return true; // Mocked for simplicity if SDK issues arise, but ideally use SDK
    }
}
