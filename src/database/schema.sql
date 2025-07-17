CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE cost_centers (
    cost_center_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    parent_id UUID REFERENCES cost_centers(cost_center_id),
    manager_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE operations_sites (
    site_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_name TEXT NOT NULL,
    site_code TEXT UNIQUE NOT NULL,
    area_sqm NUMERIC(10, 2) NOT NULL,
    usage_type TEXT NOT NULL CHECK(usage_type IN ('F&B', 'Retail', 'Entertainment', 'Services')),
    sector TEXT NOT NULL,
    description TEXT,
    base_price_per_sqm NUMERIC(12, 2) NOT NULL,
    current_price_per_sqm NUMERIC(12, 2) NOT NULL,
    total_base_price NUMERIC(14, 2) GENERATED ALWAYS AS (area_sqm * base_price_per_sqm) STORED,
    status TEXT DEFAULT 'vacant' CHECK(status IN ('vacant', 'reserved', 'leased', 'under_maintenance')),
    is_ready BOOLEAN DEFAULT true,
    assigned_to UUID,
    readiness_index NUMERIC(4,2) DEFAULT 100.0,
    image_path TEXT,
    cost_center_id UUID REFERENCES cost_centers(cost_center_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    foot_traffic_score NUMERIC(3,2) DEFAULT 0.0,
    visibility_rating NUMERIC(3,2) DEFAULT 0.0,
    accessibility_score NUMERIC(3,2) DEFAULT 0.0,
    competition_density NUMERIC(3,2) DEFAULT 0.0,
    location_premium NUMERIC(5,2) DEFAULT 0.0,
    seasonal_multiplier NUMERIC(3,2) DEFAULT 1.0,
    demand_factor NUMERIC(3,2) DEFAULT 1.0
);

CREATE TABLE clients (
    client_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    business_name TEXT,
    contact_info JSONB NOT NULL,
    business_type TEXT,
    sector TEXT,
    qualified_by UUID,
    sales_agent TEXT,
    contract_signed BOOLEAN DEFAULT false,
    financial_status TEXT DEFAULT 'pending' CHECK(financial_status IN ('pending', 'approved', 'rejected', 'under_review')),
    risk_classification TEXT DEFAULT 'medium' CHECK(risk_classification IN ('low', 'medium', 'high')),
    client_size TEXT DEFAULT 'small' CHECK(client_size IN ('small', 'medium', 'large', 'enterprise')),
    cost_center_id UUID REFERENCES cost_centers(cost_center_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    previous_leases INT DEFAULT 0,
    payment_history_score NUMERIC(3,2) DEFAULT 0.0,
    business_license TEXT,
    cr_number TEXT,
    vat_number TEXT
);

CREATE TABLE lease_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(client_id),
    site_id UUID NOT NULL REFERENCES operations_sites(site_id),
    business_name TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    requested_start_date DATE NOT NULL,
    requested_duration_months INT NOT NULL,
    monthly_rent NUMERIC(12,2) NOT NULL,
    vat_amount NUMERIC(12,2) NOT NULL,
    platform_fee NUMERIC(12,2) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    payment_method TEXT CHECK(payment_method IN ('bank_transfer', 'credit_card', 'cash', 'installments')),
    status TEXT DEFAULT 'new' CHECK(status IN ('new', 'under_review', 'approved', 'contract_signed', 'paid', 'leased', 'rejected')),
    priority_score NUMERIC(3,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by UUID,
    review_notes TEXT,
    contract_deadline DATE,
    payment_deadline DATE
);

CREATE TABLE operational_insights (
    insight_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_sites INT,
    vacant_sites INT,
    leased_sites INT,
    reserved_sites INT,
    maintenance_sites INT,
    occupancy_rate NUMERIC(5,2),
    avg_rent_per_sqm NUMERIC(10,2),
    total_revenue NUMERIC(16,2),
    pending_requests INT,
    overdue_payments INT,
    contract_renewals_due INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK(type IN ('lease_request', 'contract_deadline', 'payment_overdue', 'maintenance_required')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    recipient_email TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

CREATE INDEX idx_operations_sites_status ON operations_sites(status);
CREATE INDEX idx_operations_sites_zone ON operations_sites(zone_name);
CREATE INDEX idx_lease_requests_status ON lease_requests(status);
CREATE INDEX idx_lease_requests_created_at ON lease_requests(created_at);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_operations_sites_updated_at 
    BEFORE UPDATE ON operations_sites 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lease_requests_updated_at 
    BEFORE UPDATE ON lease_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();