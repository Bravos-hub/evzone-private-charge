import api from './index';

export const walletApi = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
  topUp: (data) => api.post('/wallet/topup', data),
};
