import razorpay
from django.conf import settings
from django.urls import reverse
from typing import Dict, Any

class RazorpayClient:
    def __init__(self):
        self.client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

    def create_order(self, booking) -> Dict[str, Any]:
        """
        Create a Razorpay order for the booking
        """
        try:
            data = {
                'amount': int(booking.total_amount * 100),  # Convert to paise
                'currency': settings.RAZORPAY_CURRENCY,
                'receipt': str(booking.booking_id),
                'notes': {
                    'booking_id': str(booking.booking_id),
                    'venue_name': booking.venue.name,
                    'customer_email': booking.user.email
                }
            }
            
            order = self.client.order.create(data=data)
            return order
        except Exception as e:
            # Log the error
            raise ValueError(f"Error creating Razorpay order: {str(e)}")

    def verify_payment_signature(self, payment_id: str, order_id: str, signature: str) -> bool:
        """
        Verify the payment signature
        """
        try:
            return self.client.utility.verify_payment_signature({
                'razorpay_payment_id': payment_id,
                'razorpay_order_id': order_id,
                'razorpay_signature': signature
            })
        except Exception as e:
            # Log the error
            return False

    def get_payment_details(self, payment_id: str) -> Dict[str, Any]:
        """
        Fetch payment details from Razorpay
        """
        try:
            return self.client.payment.fetch(payment_id)
        except Exception as e:
            # Log the error
            raise ValueError(f"Error fetching payment details: {str(e)}")

    def initiate_refund(self, payment_id: str, amount: int = None) -> Dict[str, Any]:
        """
        Initiate a refund for the payment
        If amount is not specified, full amount will be refunded
        """
        try:
            refund_data = {'payment_id': payment_id}
            if amount is not None:
                refund_data['amount'] = amount
            
            return self.client.payment.refund(payment_id, refund_data)
        except Exception as e:
            # Log the error
            raise ValueError(f"Error initiating refund: {str(e)}")

    def get_refund_details(self, refund_id: str) -> Dict[str, Any]:
        """
        Fetch refund details from Razorpay
        """
        try:
            return self.client.refund.fetch(refund_id)
        except Exception as e:
            # Log the error
            raise ValueError(f"Error fetching refund details: {str(e)}")
