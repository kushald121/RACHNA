-- Database Security Updates for Rachna E-commerce Platform
-- Run these commands in your PostgreSQL database

-- 1. Add unique constraint for UPI transaction IDs to prevent reuse
-- First, check if there are any duplicate transaction IDs
SELECT upi_transaction_id, COUNT(*) 
FROM payment_verifications 
WHERE upi_transaction_id IS NOT NULL 
GROUP BY upi_transaction_id 
HAVING COUNT(*) > 1;

-- If there are duplicates, you may need to clean them up first
-- Then add the unique constraint
ALTER TABLE payment_verifications 
ADD CONSTRAINT unique_upi_transaction_id 
UNIQUE (upi_transaction_id);

-- 2. Add indexes for better performance and security
-- Index on order status for faster filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Index on payment verifications for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_verifications_status ON payment_verifications(verification_status);
CREATE INDEX IF NOT EXISTS idx_payment_verifications_order_id ON payment_verifications(order_id);

-- Index on order status history for faster queries
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);

-- 3. Add updated_at column to orders table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'updated_at') THEN
        ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- 4. Create trigger to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Add constraints to ensure data integrity
-- Ensure order amounts are positive
ALTER TABLE orders 
ADD CONSTRAINT check_positive_total_amount 
CHECK (total_amount > 0);

-- Ensure payment verification amounts are positive
ALTER TABLE payment_verifications 
ADD CONSTRAINT check_positive_amount_paid 
CHECK (amount_paid > 0);

-- 6. Add audit trail table for sensitive operations
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    changed_by INTEGER, -- admin_user_id or user_id
    user_type VARCHAR(10), -- 'admin' or 'user'
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_table_operation ON audit_log(table_name, operation);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- 7. Create function to log order status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.order_status != NEW.order_status THEN
        INSERT INTO audit_log (
            table_name, operation, record_id, old_values, new_values, 
            changed_by, user_type, created_at
        ) VALUES (
            'orders', 'UPDATE', NEW.id,
            jsonb_build_object('order_status', OLD.order_status),
            jsonb_build_object('order_status', NEW.order_status),
            NULL, 'system', CURRENT_TIMESTAMP
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply audit trigger to orders table
DROP TRIGGER IF EXISTS audit_order_status_changes ON orders;
CREATE TRIGGER audit_order_status_changes
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION log_order_status_change();

-- 8. Add session management table for better security
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for session management
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- 9. Add failed login attempts tracking
CREATE TABLE IF NOT EXISTS failed_login_attempts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    ip_address INET NOT NULL,
    user_agent TEXT,
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attempt_type VARCHAR(20) DEFAULT 'user' -- 'user' or 'admin'
);

-- Index for failed login attempts
CREATE INDEX IF NOT EXISTS idx_failed_login_ip_time ON failed_login_attempts(ip_address, attempt_time);
CREATE INDEX IF NOT EXISTS idx_failed_login_email_time ON failed_login_attempts(email, attempt_time);

-- 10. Clean up old records (run periodically)
-- Function to clean up old audit logs (keep last 6 months)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_log 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '6 months';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Function to clean up old failed login attempts (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_failed_attempts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM failed_login_attempts 
    WHERE attempt_time < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- 11. Add row-level security policies (optional, for advanced security)
-- Enable RLS on sensitive tables
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payment_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies (uncomment if you want to enable RLS)
-- CREATE POLICY orders_user_policy ON orders
--     FOR ALL TO authenticated_users
--     USING (user_id = current_user_id());

-- 12. Add comments for documentation
COMMENT ON TABLE audit_log IS 'Audit trail for sensitive operations';
COMMENT ON TABLE user_sessions IS 'Active user sessions for security tracking';
COMMENT ON TABLE failed_login_attempts IS 'Failed login attempts for security monitoring';
COMMENT ON CONSTRAINT unique_upi_transaction_id ON payment_verifications IS 'Ensures each UPI transaction ID can only be used once';

-- 13. Grant appropriate permissions (adjust as needed)
-- GRANT SELECT, INSERT ON audit_log TO your_app_user;
-- GRANT SELECT, INSERT, DELETE ON user_sessions TO your_app_user;
-- GRANT SELECT, INSERT ON failed_login_attempts TO your_app_user;

-- End of security updates
-- Remember to run cleanup functions periodically using a cron job or scheduled task
