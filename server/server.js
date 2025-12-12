const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// ==== Datos demo en memoria ====

// Sucursales (MPV)
let branches = [
  {
    id: 1,
    name: "Abarrotes Centro",
    code: "PV-001",
    url_delivery: "https://delivery.ventamaestra.com/pv-001",
    type: "Abarrotes",
    active: true
  },
  {
    id: 2,
    name: "Farmacia Norte",
    code: "PV-002",
    url_delivery: "https://delivery.ventamaestra.com/pv-002",
    type: "Farmacia",
    active: true
  },
  {
    id: 3,
    name: "Restaurante La Esquina",
    code: "PV-003",
    url_delivery: "https://delivery.ventamaestra.com/pv-003",
    type: "Restaurante",
    active: false
  }
];

// Licencias
let licenses = [
  {
    folio: "LIC-0001",
    client_name: "Comercial La Maestra",
    type: "Prueba 15 días",
    start_date: "2025-12-01",
    end_date: "2025-12-16",
    branch_ids: [1],
    status: "Activa"
  },
  {
    folio: "LIC-0002",
    client_name: "Cadena Salud Norte",
    type: "Completa",
    start_date: "2025-10-10",
    end_date: "2026-10-10",
    branch_ids: [2, 3],
    status: "Activa"
  }
];

// Productos (compartidos)
let products = [
  { id: 1, name: "Refresco 600ml", price: 18, cost: 10, stock_global: 120 },
  { id: 2, name: "Papas fritas 45g", price: 14, cost: 7, stock_global: 80 },
  { id: 3, name: "Pan de caja", price: 42, cost: 25, stock_global: 40 },
  { id: 4, name: "Detergente 1L", price: 55, cost: 30, stock_global: 35 },
  { id: 5, name: "Medicamento X 10pz", price: 120, cost: 70, stock_global: 15 }
];

// Ventas simple (para corte)
let sales = [];

// Pedidos a domicilio demo
let deliveryOrders = [
  {
    id: "PED-1001",
    branch_id: 1,
    customer: "Luis Martínez",
    address: "Calle 1 #123",
    total: 132,
    status: "Pendiente"
  },
  {
    id: "PED-1002",
    branch_id: 2,
    customer: "Farmacia Centro",
    address: "Av. Salud #45",
    total: 240,
    status: "Preparando"
  }
];

// ==== Rutas API ====

// Ping
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, message: "VentaMaestra 2.0 API online" });
});

// Productos
app.get("/api/products", (req, res) => {
  res.json(products);
});

// Sucursales
app.get("/api/branches", (req, res) => {
  res.json(branches);
});

// Licencias
app.get("/api/licenses", (req, res) => {
  res.json(licenses);
});

// Ventas (crear venta sencilla desde TPV)
app.post("/api/sales", (req, res) => {
  const { branch_id, items, total } = req.body || {};
  const id = `VTA-${sales.length + 1}`.padStart(8, "0");
  const createdAt = new Date().toISOString();

  const sale = {
    id,
    branch_id: branch_id || 1,
    items: items || [],
    total: total || 0,
    createdAt
  };

  sales.push(sale);

  res.status(201).json({
    ok: true,
    message: "Venta registrada (demo, en memoria).",
    sale
  });
});

// Resumen de ventas (para corte rápido)
app.get("/api/sales/summary", (req, res) => {
  const totalTickets = sales.length;
  const totalAmount = sales.reduce((sum, s) => sum + (s.total || 0), 0);

  res.json({
    totalTickets,
    totalAmount,
    lastSaleAt: sales.length ? sales[sales.length - 1].createdAt : null
  });
});

// Pedidos a domicilio
app.get("/api/delivery", (req, res) => {
  res.json(deliveryOrders);
});

// Actualizar estado de pedido (ej: Pendiente → Preparando → Entregado)
app.post("/api/delivery/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  const order = deliveryOrders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ ok: false, message: "Pedido no encontrado" });
  }

  order.status = status || order.status;
  res.json({ ok: true, order });
});

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`✅ VentaMaestra 2.0 API escuchando en http://localhost:${PORT}`);
});
