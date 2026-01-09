import React, { useState } from 'react';
import { Database, Key, Link2, User, Package, Calendar, Star, CreditCard, Tag, Search, Gift, ArrowRight } from 'lucide-react';
import './DiagramStyles.css';

const DatabaseSchemaDiagram = () => {
  const [hoveredTable, setHoveredTable] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  const tables = [
    {
      id: 'users',
      name: 'users',
      icon: User,
      type: 'primary',
      columns: [
        { name: 'id', type: 'UUID', isPK: true },
        { name: 'email', type: 'VARCHAR(255)', isUnique: true },
        { name: 'password_hash', type: 'VARCHAR(255)' },
        { name: 'first_name', type: 'VARCHAR(100)' },
        { name: 'last_name', type: 'VARCHAR(100)' },
        { name: 'role', type: "ENUM('customer','admin')" },
        { name: 'phone', type: 'VARCHAR(20)' },
      ],
      position: { row: 0, col: 0 }
    },
    {
      id: 'equipment_categories',
      name: 'equipment_categories',
      icon: Tag,
      type: 'reference',
      columns: [
        { name: 'id', type: 'UUID', isPK: true },
        { name: 'name', type: 'VARCHAR(100)', isUnique: true },
        { name: 'description', type: 'TEXT' },
      ],
      position: { row: 0, col: 1 }
    },
    {
      id: 'promo_codes',
      name: 'promo_codes',
      icon: Gift,
      type: 'reference',
      columns: [
        { name: 'id', type: 'UUID', isPK: true },
        { name: 'code', type: 'VARCHAR(50)', isUnique: true },
        { name: 'discount_type', type: 'ENUM' },
        { name: 'discount_value', type: 'DECIMAL' },
        { name: 'max_uses', type: 'INTEGER' },
        { name: 'expires_at', type: 'TIMESTAMP' },
      ],
      position: { row: 0, col: 2 }
    },
    {
      id: 'search_analytics',
      name: 'search_analytics',
      icon: Search,
      type: 'analytics',
      columns: [
        { name: 'id', type: 'UUID', isPK: true },
        { name: 'user_id', type: 'UUID', isFK: true, references: 'users' },
        { name: 'query', type: 'VARCHAR(255)' },
        { name: 'selected_item_id', type: 'UUID', isFK: true },
        { name: 'ip_address', type: 'VARCHAR(45)' },
      ],
      position: { row: 0, col: 3 }
    },
    {
      id: 'equipment',
      name: 'equipment',
      icon: Package,
      type: 'reference',
      columns: [
        { name: 'id', type: 'UUID', isPK: true },
        { name: 'category_id', type: 'UUID', isFK: true, references: 'equipment_categories' },
        { name: 'name', type: 'VARCHAR(200)' },
        { name: 'brand', type: 'VARCHAR(100)' },
        { name: 'daily_rate', type: 'DECIMAL(10,2)' },
        { name: 'weekly_rate', type: 'DECIMAL(10,2)' },
        { name: 'quantity_total', type: 'INTEGER' },
      ],
      position: { row: 1, col: 0 }
    },
    {
      id: 'bookings',
      name: 'bookings',
      icon: Calendar,
      type: 'primary',
      columns: [
        { name: 'id', type: 'UUID', isPK: true },
        { name: 'user_id', type: 'UUID', isFK: true, references: 'users' },
        { name: 'equipment_id', type: 'UUID', isFK: true, references: 'equipment' },
        { name: 'start_date', type: 'DATE' },
        { name: 'end_date', type: 'DATE' },
        { name: 'status', type: 'ENUM' },
        { name: 'total_amount', type: 'DECIMAL' },
      ],
      position: { row: 1, col: 1 }
    },
    {
      id: 'reviews',
      name: 'reviews',
      icon: Star,
      type: 'primary',
      columns: [
        { name: 'id', type: 'UUID', isPK: true },
        { name: 'booking_id', type: 'UUID', isFK: true, references: 'bookings', isUnique: true },
        { name: 'user_id', type: 'UUID', isFK: true, references: 'users' },
        { name: 'equipment_id', type: 'UUID', isFK: true, references: 'equipment' },
        { name: 'rating', type: 'INTEGER (1-5)' },
        { name: 'comment', type: 'TEXT' },
      ],
      position: { row: 1, col: 2 }
    },
    {
      id: 'promo_code_uses',
      name: 'promo_code_uses',
      icon: Gift,
      type: 'junction',
      columns: [
        { name: 'id', type: 'UUID', isPK: true },
        { name: 'promo_code_id', type: 'UUID', isFK: true, references: 'promo_codes' },
        { name: 'user_id', type: 'UUID', isFK: true, references: 'users' },
        { name: 'booking_id', type: 'UUID', isFK: true, references: 'bookings' },
        { name: 'discount_applied', type: 'DECIMAL' },
      ],
      position: { row: 1, col: 3 }
    },
    {
      id: 'user_credits',
      name: 'user_credits',
      icon: CreditCard,
      type: 'primary',
      columns: [
        { name: 'id', type: 'UUID', isPK: true },
        { name: 'user_id', type: 'UUID', isFK: true, references: 'users', isUnique: true },
        { name: 'balance', type: 'DECIMAL(10,2)' },
        { name: 'total_earned', type: 'DECIMAL' },
        { name: 'total_spent', type: 'DECIMAL' },
      ],
      position: { row: 2, col: 0 }
    },
    {
      id: 'credit_transactions',
      name: 'credit_transactions',
      icon: CreditCard,
      type: 'reference',
      columns: [
        { name: 'id', type: 'UUID', isPK: true },
        { name: 'user_id', type: 'UUID', isFK: true, references: 'users' },
        { name: 'transaction_type', type: 'VARCHAR(30)' },
        { name: 'amount', type: 'DECIMAL' },
        { name: 'balance_after', type: 'DECIMAL' },
      ],
      position: { row: 2, col: 1 }
    },
  ];

  const relationships = [
    { from: 'users', to: 'bookings', type: '1:N' },
    { from: 'users', to: 'reviews', type: '1:N' },
    { from: 'users', to: 'user_credits', type: '1:1' },
    { from: 'users', to: 'credit_transactions', type: '1:N' },
    { from: 'users', to: 'search_analytics', type: '1:N' },
    { from: 'users', to: 'promo_code_uses', type: '1:N' },
    { from: 'equipment_categories', to: 'equipment', type: '1:N' },
    { from: 'equipment', to: 'bookings', type: '1:N' },
    { from: 'equipment', to: 'reviews', type: '1:N' },
    { from: 'bookings', to: 'reviews', type: '1:1' },
    { from: 'bookings', to: 'promo_code_uses', type: '1:1' },
    { from: 'promo_codes', to: 'promo_code_uses', type: '1:N' },
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'primary': return '#FF6B35';
      case 'reference': return '#00D4AA';
      case 'junction': return '#6366F1';
      case 'analytics': return '#8B5CF6';
      default: return '#ffffff';
    }
  };

  const TableCard = ({ table }) => {
    const Icon = table.icon;
    const color = getTypeColor(table.type);
    const isHovered = hoveredTable === table.id;
    const isSelected = selectedTable === table.id;
    const isRelated = hoveredTable && relationships.some(r =>
      (r.from === hoveredTable && r.to === table.id) ||
      (r.to === hoveredTable && r.from === table.id)
    );

    return (
      <div
        className={`db-table-card ${isHovered ? 'hovered' : ''} ${isSelected ? 'selected' : ''} ${isRelated ? 'related' : ''}`}
        style={{ '--table-color': color }}
        onMouseEnter={() => setHoveredTable(table.id)}
        onMouseLeave={() => setHoveredTable(null)}
        onClick={() => setSelectedTable(selectedTable === table.id ? null : table.id)}
      >
        <div className="db-table-header" style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
          <Icon size={18} />
          <span className="db-table-name">{table.name}</span>
          <div className="db-table-badges">
            <span className="db-badge pk">PK</span>
            {table.columns.some(c => c.isFK) && <span className="db-badge fk">FK</span>}
          </div>
        </div>
        <div className="db-table-columns">
          {table.columns.slice(0, isSelected ? undefined : 5).map((col, idx) => (
            <div key={idx} className={`db-column ${col.isPK ? 'pk' : ''} ${col.isFK ? 'fk' : ''}`}>
              <span className="db-column-icon">
                {col.isPK && <Key size={12} />}
                {col.isFK && <Link2 size={12} />}
              </span>
              <span className="db-column-name">{col.name}</span>
              <span className="db-column-type">{col.type}</span>
            </div>
          ))}
          {!isSelected && table.columns.length > 5 && (
            <div className="db-column more">
              +{table.columns.length - 5} more columns
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="db-diagram-container">
      <div className="db-diagram-header">
        <div className="db-diagram-title">
          <Database size={24} />
          <h3>Database Schema</h3>
        </div>
        <div className="db-diagram-subtitle">
          PostgreSQL • 10 Tables • UUID Primary Keys
        </div>
      </div>

      <div className="db-diagram-grid">
        {/* Row 0 */}
        <div className="db-diagram-row">
          {tables.filter(t => t.position.row === 0).map(table => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>

        {/* Row 1 */}
        <div className="db-diagram-row">
          {tables.filter(t => t.position.row === 1).map(table => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>

        {/* Row 2 */}
        <div className="db-diagram-row row-partial">
          {tables.filter(t => t.position.row === 2).map(table => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      </div>

      <div className="db-diagram-legend">
        <div className="db-legend-title">Legend</div>
        <div className="db-legend-items">
          <div className="db-legend-item">
            <div className="db-legend-color" style={{ background: '#FF6B35' }}></div>
            <span>Primary Entity (User-centric)</span>
          </div>
          <div className="db-legend-item">
            <div className="db-legend-color" style={{ background: '#00D4AA' }}></div>
            <span>Reference Entity</span>
          </div>
          <div className="db-legend-item">
            <div className="db-legend-color" style={{ background: '#6366F1' }}></div>
            <span>Junction Table</span>
          </div>
          <div className="db-legend-item">
            <div className="db-legend-color" style={{ background: '#8B5CF6' }}></div>
            <span>Analytics</span>
          </div>
          <div className="db-legend-item">
            <Key size={14} />
            <span>Primary Key</span>
          </div>
          <div className="db-legend-item">
            <Link2 size={14} />
            <span>Foreign Key</span>
          </div>
        </div>
      </div>

      <div className="db-relationships-info">
        <div className="db-rel-title">Key Relationships</div>
        <div className="db-rel-list">
          <div className="db-rel-item">
            <span className="db-rel-from">users</span>
            <ArrowRight size={14} />
            <span className="db-rel-to">bookings, reviews, credits</span>
            <span className="db-rel-type">1:N</span>
          </div>
          <div className="db-rel-item">
            <span className="db-rel-from">equipment</span>
            <ArrowRight size={14} />
            <span className="db-rel-to">bookings, reviews</span>
            <span className="db-rel-type">1:N</span>
          </div>
          <div className="db-rel-item">
            <span className="db-rel-from">categories</span>
            <ArrowRight size={14} />
            <span className="db-rel-to">equipment</span>
            <span className="db-rel-type">1:N</span>
          </div>
          <div className="db-rel-item">
            <span className="db-rel-from">bookings</span>
            <ArrowRight size={14} />
            <span className="db-rel-to">reviews</span>
            <span className="db-rel-type">1:1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSchemaDiagram;
