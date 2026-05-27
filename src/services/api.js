import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export const authAPI = {
    login: (username, password) => api.post('/auth/login', { username, password }),
    register: (data) => api.post('/auth/register', data),
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/auth/me'),
};

export const doctorsAPI = {
    getAll: (specialization = '') => api.get('/doctors', { params: { specialization } }),
    getSpecializations: () => api.get('/doctors/specializations'),
    getById: (id) => api.get(`/doctors/${id}`),
};

export const appointmentsAPI = {
    getAvailable: (doctorId, date) => api.get('/appointments/available', { params: { doctor_id: doctorId, date } }),
    book: (appointmentId, patientId) => api.post('/appointments/book', { appointment_id: appointmentId, patient_id: patientId }),
    cancel: (appointmentId) => api.post('/appointments/cancel', { appointment_id: appointmentId }),
    getMy: () => api.get('/appointments/my'),
};

export const patientsAPI = {
    getMy: () => api.get('/patients/my'),
    add: (data) => api.post('/patients/add', data),
    remove: (patientId) => api.delete(`/patients/remove/${patientId}`),
};

export const schedulesAPI = {
    getPublic: (doctorId) => api.get(`/schedules/public?doctor_id=${doctorId}`),
};

export const medicalHistoryAPI = {
    getByPatientId: (patientId) => api.get(`/medical-history/patient/${patientId}`),
};

export default api;
