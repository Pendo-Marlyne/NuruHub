import base64
from datetime import datetime

import requests
from django.conf import settings


class MpesaService:
    SANDBOX_BASE = 'https://sandbox.safaricom.co.ke'
    PRODUCTION_BASE = 'https://api.safaricom.co.ke'

    def __init__(self):
        self.base_url = self.PRODUCTION_BASE if settings.MPESA_ENV == 'production' else self.SANDBOX_BASE

    def _get_access_token(self):
        credentials = f"{settings.MPESA_CONSUMER_KEY}:{settings.MPESA_CONSUMER_SECRET}"
        encoded = base64.b64encode(credentials.encode()).decode()
        response = requests.get(
            f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials",
            headers={'Authorization': f'Basic {encoded}'},
            timeout=30,
        )
        response.raise_for_status()
        return response.json()['access_token']

    def initiate_stk_push(self, phone_number, amount, account_reference, transaction_desc):
        if not settings.MPESA_CONSUMER_KEY:
            return {
                'simulated': True,
                'CheckoutRequestID': f'SIM-{datetime.now().strftime("%Y%m%d%H%M%S")}',
                'MerchantRequestID': f'MER-{datetime.now().strftime("%Y%m%d%H%M%S")}',
                'ResponseCode': '0',
                'ResponseDescription': 'Simulated STK push (configure MPESA credentials for live)',
            }

        token = self._get_access_token()
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password_str = f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}"
        password = base64.b64encode(password_str.encode()).decode()

        phone = phone_number.strip()
        if phone.startswith('0'):
            phone = '254' + phone[1:]
        elif phone.startswith('+'):
            phone = phone[1:]

        payload = {
            'BusinessShortCode': settings.MPESA_SHORTCODE,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': 'CustomerPayBillOnline',
            'Amount': int(float(amount)),
            'PartyA': phone,
            'PartyB': settings.MPESA_SHORTCODE,
            'PhoneNumber': phone,
            'CallBackURL': settings.MPESA_CALLBACK_URL,
            'AccountReference': account_reference,
            'TransactionDesc': transaction_desc,
        }

        response = requests.post(
            f"{self.base_url}/mpesa/stkpush/v1/processrequest",
            json=payload,
            headers={'Authorization': f'Bearer {token}'},
            timeout=30,
        )
        response.raise_for_status()
        return response.json()
