-- ============================================
-- COFFEE TRACEABILITY DATABASE SCHEMA
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'exporter' CHECK (role IN ('admin', 'exporter', 'coop', 'buyer')),
    organization VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farmers table
CREATE TABLE IF NOT EXISTS farmers (
    id SERIAL PRIMARY KEY,
    farmer_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    cooperative_name VARCHAR(100),
    id_number VARCHAR(50),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farms table
CREATE TABLE IF NOT EXISTS farms (
    id SERIAL PRIMARY KEY,
    farm_code VARCHAR(50) UNIQUE NOT NULL,
    farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    location_description VARCHAR(200),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    altitude INTEGER,
    area_hectares DECIMAL(10, 2),
    coffee_variety VARCHAR(100),
    tree_age INTEGER,
    certifications TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lots table
CREATE TABLE IF NOT EXISTS lots (
    id SERIAL PRIMARY KEY,
    lot_number VARCHAR(50) UNIQUE NOT NULL,
    farm_id INTEGER REFERENCES farms(id),
    farmer_id INTEGER REFERENCES farmers(id),
    harvest_date DATE,
    processing_method VARCHAR(50) CHECK (processing_method IN ('washed', 'natural', 'honey', 'anaerobic')),
    grade VARCHAR(20) CHECK (grade IN ('G1', 'G2', 'G3', 'G4')),
    sca_score DECIMAL(5, 2),
    moisture_content DECIMAL(5, 2),
    quantity_kg DECIMAL(10, 2),
    screen_size VARCHAR(20),
    notes TEXT,
    qr_code TEXT,
    status VARCHAR(50) DEFAULT 'growing' CHECK (status IN ('growing', 'harvested', 'processing', 'milling', 'stored', 'exported')),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quality Assessments (SCA)
CREATE TABLE IF NOT EXISTS quality_assessments (
    id SERIAL PRIMARY KEY,
    lot_id INTEGER REFERENCES lots(id) ON DELETE CASCADE,
    assessed_by VARCHAR(100),
    assessment_date DATE,
    fragrance_aroma INTEGER CHECK (fragrance_aroma >= 0 AND fragrance_aroma <= 10),
    flavor INTEGER CHECK (flavor >= 0 AND flavor <= 10),
    aftertaste INTEGER CHECK (aftertaste >= 0 AND aftertaste <= 10),
    acidity INTEGER CHECK (acidity >= 0 AND acidity <= 10),
    body INTEGER CHECK (body >= 0 AND body <= 10),
    uniformity INTEGER CHECK (uniformity >= 0 AND uniformity <= 10),
    balance INTEGER CHECK (balance >= 0 AND balance <= 10),
    clean_cup INTEGER CHECK (clean_cup >= 0 AND clean_cup <= 10),
    sweetness INTEGER CHECK (sweetness >= 0 AND sweetness <= 10),
    overall INTEGER CHECK (overall >= 0 AND overall <= 10),
    defects INTEGER CHECK (defects >= 0 AND defects <= 10),
    total_score DECIMAL(5, 2),
    certified_by VARCHAR(100),
    certificate_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trace Events
CREATE TABLE IF NOT EXISTS trace_events (
    id SERIAL PRIMARY KEY,
    lot_id INTEGER REFERENCES lots(id) ON DELETE CASCADE,
    event_type VARCHAR(50) CHECK (event_type IN ('harvest', 'washing', 'drying', 'milling', 'storage', 'export', 'quality_check')),
    event_date DATE,
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    description TEXT,
    image_urls TEXT[],
    temperature DECIMAL(5, 2),
    humidity DECIMAL(5, 2),
    operator_name VARCHAR(100),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shipments
CREATE TABLE IF NOT EXISTS shipments (
    id SERIAL PRIMARY KEY,
    shipment_number VARCHAR(50) UNIQUE NOT NULL,
    lot_ids INTEGER[],
    container_number VARCHAR(50),
    shipping_line VARCHAR(100),
    bill_of_lading VARCHAR(100),
    export_date DATE,
    port_of_origin VARCHAR(100),
    port_of_destination VARCHAR(100),
    quantity_kg DECIMAL(10, 2),
    number_of_bags INTEGER,
    fob_price_usd DECIMAL(10, 2),
    buyer_name VARCHAR(100),
    buyer_company VARCHAR(100),
    buyer_country VARCHAR(100),
    eudr_compliant BOOLEAN DEFAULT false,
    gps_validated BOOLEAN DEFAULT false,
    documents TEXT[],
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EUDR Compliance Documents
CREATE TABLE IF NOT EXISTS compliance_documents (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER REFERENCES shipments(id) ON DELETE CASCADE,
    document_type VARCHAR(50) CHECK (document_type IN ('gps_coordinates', 'deforestation_proof', 'due_diligence', 'traceability_report')),
    document_url VARCHAR(500),
    verified_by VARCHAR(100),
    verified_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lots_lot_number ON lots(lot_number);
CREATE INDEX IF NOT EXISTS idx_lots_farm_id ON lots(farm_id);
CREATE INDEX IF NOT EXISTS idx_lots_status ON lots(status);
CREATE INDEX IF NOT EXISTS idx_trace_events_lot_id ON trace_events(lot_id);
CREATE INDEX IF NOT EXISTS idx_trace_events_event_type ON trace_events(event_type);
CREATE INDEX IF NOT EXISTS idx_farms_farmer_id ON farms(farmer_id);
CREATE INDEX IF NOT EXISTS idx_shipments_export_date ON shipments(export_date);
CREATE INDEX IF NOT EXISTS idx_shipments_eudr_compliant ON shipments(eudr_compliant);

-- Insert sample admin user (password: admin123)
INSERT INTO users (name, email, password, role, organization) VALUES 
('Admin User', 'admin@coffee.com', '$2b$10$VLmGoRORqiVgLdj36gS4..xgMhH0hIkzUbbC47wNxXRvSahp6SL82', 'admin', 'Coffee Traceability')
ON CONFLICT (email) DO NOTHING;

-- Insert sample exporter
INSERT INTO users (name, email, password, role, organization) VALUES 
('Sample Exporter', 'exporter@coffee.com', '$2b$10$VLmGoRORqiVgLdj36gS4..xgMhH0hIkzUbbC47wNxXRvSahp6SL82', 'exporter', 'Ethiopian Coffee Export PLC')
ON CONFLICT (email) DO NOTHING;

-- Insert sample farmer
INSERT INTO farmers (farmer_code, name, phone, cooperative_name) VALUES 
('FARM001', 'Tadesse Bekele', '0912345678', 'Yirgacheffe Coffee Farmers Cooperative')
ON CONFLICT (farmer_code) DO NOTHING;

-- Insert sample farm
INSERT INTO farms (farm_code, farmer_id, name, latitude, longitude, altitude, area_hectares, coffee_variety) VALUES 
('FARM001A', 1, 'Tadesse Highland Farm', 6.1234, 38.5678, 1850, 2.5, 'Heirloom')
ON CONFLICT (farm_code) DO NOTHING;

-- Insert sample lot
INSERT INTO lots (lot_number, farm_id, farmer_id, harvest_date, processing_method, quantity_kg, status) VALUES 
('LOT2024001', 1, 1, '2024-11-15', 'washed', 5000, 'stored')
ON CONFLICT (lot_number) DO NOTHING;

-- Insert sample trace events
INSERT INTO trace_events (lot_id, event_type, event_date, description) VALUES 
(1, 'harvest', '2024-11-15', 'Hand-picked ripe cherries from high altitude section'),
(1, 'washing', '2024-11-16', 'Fermented for 24 hours, washed 3 times with clean spring water'),
(1, 'drying', '2024-11-18', 'Dried on raised African beds for 14 days, turned every 2 hours'),
(1, 'storage', '2024-12-05', 'Stored in GrainPro bags at 18°C, 55% humidity')
ON CONFLICT DO NOTHING;

-- Insert sample quality assessment
INSERT INTO quality_assessments (lot_id, assessed_by, assessment_date, fragrance_aroma, flavor, aftertaste, acidity, body, uniformity, balance, clean_cup, sweetness, overall, defects, total_score, certified_by) VALUES 
(1, 'Q Grader: M. Johnson', '2024-12-10', 8.5, 8.0, 7.5, 8.5, 8.0, 10, 8.0, 10, 10, 8.0, 2, 86.5, 'CQI')
ON CONFLICT DO NOTHING;

-- Verify data was inserted
SELECT 'Users:' as Type, COUNT(*) as Count FROM users
UNION ALL
SELECT 'Farmers:', COUNT(*) FROM farmers
UNION ALL
SELECT 'Farms:', COUNT(*) FROM farms
UNION ALL
SELECT 'Lots:', COUNT(*) FROM lots;