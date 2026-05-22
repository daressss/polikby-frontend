// Публичное расписание (без авторизации)
router.get('/public', async (req, res) => {
    try {
        const [schedules] = await pool.execute(
            `SELECT s.*, d.full_name as doctor_name, d.specialization,
                    (SELECT COUNT(*) FROM appointments a WHERE a.schedule_id = s.id AND a.status != 'cancelled') as total_slots,
                    (SELECT COUNT(*) FROM appointments a WHERE a.schedule_id = s.id AND a.status = 'booked') as booked_slots
             FROM schedules s
             JOIN doctors d ON s.doctor_id = d.id
             WHERE s.work_date >= CURDATE()
             ORDER BY s.work_date ASC, s.start_time ASC
             LIMIT 20`
        );
        res.json({ success: true, schedules });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});