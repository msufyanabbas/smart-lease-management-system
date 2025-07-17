INSERT INTO cost_centers (name, code) VALUES
('Boulevard World Operations', 'BW001'),
('F&B Zone', 'FB001'),
('Retail Zone', 'RT001'),
('Entertainment Zone', 'EN001'),
('Services Zone', 'SV001');

INSERT INTO operations_sites (
    zone_name, site_code, area_sqm, usage_type, sector, description,
    base_price_per_sqm, current_price_per_sqm, status, is_ready,
    foot_traffic_score, visibility_rating, accessibility_score, competition_density,
    location_premium, seasonal_multiplier, demand_factor, readiness_index,
    cost_center_id
) VALUES
('Main Food Court', 'FB-A001', 50.0, 'F&B', 'Food Court', 'Premium location in main food court', 
 120.0, 120.0, 'vacant', true, 9.5, 9.0, 8.5, 7.0, 25.0, 1.0, 1.2, 95.0,
 (SELECT cost_center_id FROM cost_centers WHERE code = 'FB001')),

('Main Food Court', 'FB-A002', 45.0, 'F&B', 'Food Court', 'Corner spot with high visibility',
 115.0, 115.0, 'vacant', true, 9.0, 8.5, 8.0, 6.5, 20.0, 1.0, 1.1, 92.0,
 (SELECT cost_center_id FROM cost_centers WHERE code = 'FB001')),

('Outdoor Dining', 'FB-B001', 80.0, 'F&B', 'Outdoor', 'Terrace dining with garden view',
 100.0, 100.0, 'leased', true, 8.0, 7.5, 7.0, 5.0, 15.0, 1.3, 1.0, 88.0,
 (SELECT cost_center_id FROM cost_centers WHERE code = 'FB001')),

('Café Strip', 'FB-C001', 35.0, 'F&B', 'Café', 'Cozy café spot near entrance',
 90.0, 90.0, 'vacant', true, 7.5, 8.0, 9.0, 6.0, 10.0, 1.0, 1.0, 85.0,
 (SELECT cost_center_id FROM cost_centers WHERE code = 'FB001')),

('Fashion Street', 'RT-A001', 120.0, 'Retail', 'Fashion', 'Premium fashion boutique space',
 95.0, 95.0, 'vacant', true, 8.5, 9.0, 8.0, 7.5, 22.0, 1.1, 1.0, 90.0,
 (SELECT cost_center_id FROM cost_centers WHERE code = 'RT001')),

('Fashion Street', 'RT-A002', 100.0, 'Retail', 'Fashion', 'Mid-tier fashion retail',
 85.0, 85.0, 'leased', true, 8.0, 8.5, 7.5, 7.0, 18.0, 1.1, 1.0, 87.0,
 (SELECT cost_center_id FROM cost_centers WHERE code = 'RT001')),

('Electronics Hub', 'RT-B001', 150.0, 'Retail', 'Electronics', 'Large electronics showroom',
 75.0, 75.0, 'vacant', true, 7.0, 8.0, 8.5, 6.5, 12.0, 1.0, 1.0, 82.0,
 (SELECT cost_center_id FROM cost_centers WHERE code = 'RT001')),

('Accessories Corner', 'RT-C001', 25.0, 'Retail', 'Accessories', 'Small accessories kiosk',
 130.0, 130.0, 'vacant', true, 8.0, 7.0, 8.0, 8.5, 20.0, 1.0, 1.0, 80.0,
 (SELECT cost_center_id FROM cost_centers WHERE code = 'RT001')),

('Gaming Arena', 'EN-A001', 200.0, 'Entertainment', 'Gaming', 'Large gaming and VR space',
 65.0, 65.0, 'vacant', true, 9.0, 8.5, 8.0, 4.0, 20.0, 1.0, 1.4, 93.0,
 (SELECT cost_center_id FROM cost_centers WHERE code = 'EN001')),

('Kids Zone', 'EN-B001', 150.0, 'Entertainment', 'Kids', 'Children play area and activities',
 70.0, 70.0, 'leased', true, 8.5, 7.5, 9.0, 3.5, 15.0, 1.2, 1.3, 91.0,
 (SELECT cost_center_id FROM cost_centers WHERE code = 'EN001')),

('Banking Hub', 'SV-A001', 60.0, 'Services', 'Banking', 'ATM and banking services',
 80.0, 80.0, 'leased', true, 8.0, 8.5, 9.5, 4.0, 10.0, 1.0, 1.0, 94.0,
 (SELECT cost_center_id FROM cost_centers WHERE code = 'SV001')),

('Medical Services', 'SV-B001', 90.0, 'Services', 'Healthcare', 'Clinic and pharmacy',
 90.0, 90.0, 'vacant', true, 7.0, 8.0, 9.0, 3.0, 12.0, 1.0, 1.0, 86.0,
 (SELECT cost_center_id FROM cost_centers WHERE code = 'SV001'));

INSERT INTO clients (
    client_name, business_name, contact_info, business_type, sector,
    risk_classification, client_size, previous_leases, payment_history_score,
    business_license, cr_number, vat_number
) VALUES
('Ahmed Al-Hassan', 'Burger Palace', '{"phone": "+966501234567", "email": "ahmed@burgerpalace.sa"}', 
 'Restaurant', 'F&B', 'low', 'medium', 2, 8.5, 'BL-2023-001', '1234567890', '123456789012345'),

('Fatima Restaurant Group', 'Fatima Sweets', '{"phone": "+966502345678", "email": "info@fatimasweets.sa"}',
 'Sweets & Bakery', 'F&B', 'low', 'large', 5, 9.2, 'BL-2023-002', '2345678901', '234567890123456'),

('Modern Fashion LLC', 'Trendy Styles', '{"phone": "+966503456789", "email": "contact@trendystyles.sa"}',
 'Fashion Retail', 'Retail', 'medium', 'medium', 1, 7.0, 'BL-2023-003', '3456789012', '345678901234567');

INSERT INTO lease_requests (
    client_id, site_id, business_name, activity_type, requested_start_date,
    requested_duration_months, monthly_rent, vat_amount, platform_fee, total_amount,
    payment_method, status, priority_score
) VALUES
((SELECT client_id FROM clients WHERE business_name = 'Burger Palace'),
 (SELECT site_id FROM operations_sites WHERE site_code = 'FB-A001'),
 'Burger Palace', 'F&B', '2024-02-01', 12, 6000.0, 900.0, 120.0, 7020.0,
 'bank_transfer', 'under_review', 8.5),

((SELECT client_id FROM clients WHERE business_name = 'Trendy Styles'),
 (SELECT site_id FROM operations_sites WHERE site_code = 'RT-A001'),
 'Trendy Styles', 'Retail', '2024-02-15', 24, 11400.0, 1710.0, 228.0, 13338.0,
 'credit_card', 'new', 7.0);

INSERT INTO operational_insights (
    total_sites, vacant_sites, leased_sites, reserved_sites, maintenance_sites,
    occupancy_rate, avg_rent_per_sqm, total_revenue, pending_requests,
    overdue_payments, contract_renewals_due
) VALUES
(12, 8, 3, 1, 0, 33.33, 92.5, 35000.0, 2, 0, 1);

INSERT INTO notifications (type, title, message, recipient_email, status) VALUES
('lease_request', 'New Lease Request', 'New lease request from Burger Palace for site FB-A001', 
 'manager@boulevardworld.sa', 'pending'),

('lease_request', 'Lease Request Update', 'Lease request from Trendy Styles requires review',
 'leasing@boulevardworld.sa', 'pending');