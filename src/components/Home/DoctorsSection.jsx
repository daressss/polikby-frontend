import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserMd, FaStethoscope, FaMapMarkerAlt } from 'react-icons/fa';

const DoctorsSection = ({ doctors }) => {
    if (!doctors || doctors.length === 0) {
        return (
            <div className="text-center py-5">
                <p>Нет данных о врачах</p>
            </div>
        );
    }

    return (
        <div className="row mt-4">
            {doctors.map((doctor) => (
                <div key={doctor.id} className="col-md-3 mb-4">
                    <div className="doctor-card">
                        <div className="doctor-avatar">
                            <FaUserMd />
                        </div>
                        <div className="doctor-info">
                            <h5 className="doctor-name">{doctor.full_name}</h5>
                            <p className="doctor-specialization">
                                <FaStethoscope className="me-1" size={12} /> {doctor.specialization}
                            </p>
                            <p className="text-muted small">
                                <FaMapMarkerAlt className="me-1" /> Каб. {doctor.room_number}
                            </p>
                            <Link to={`/doctors`} className="btn btn-sm btn-outline-success mt-2 w-100">
                                Подробнее
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DoctorsSection;