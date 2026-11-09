'use strict';

// ==================================
// 1. DATA LAYANAN SALON
// ==================================

const services = [
    {
        id: 1,
        name: 'Make Up',
        price: 200000,
        image: 'makeup.jpg'
    },
    {
        id: 2,
        name: 'Hair Styling',
        price: 90000,
        image: 'hair.jpg'
    },
    {
        id: 3,
        name: 'Creambath',
        price: 75000,
        image: 'creambath.jpg'
    },
    {
        id: 4,
        name: 'Pedicure',
        price: 70000,
        image: 'pedicure.jpg'
    },
    {
        id: 5,
        name: 'Masker Rambut',
        price: 60000,
        image: 'creambath.jpg'
    },
    {
        id: 6,
        name: 'Manicure',
        price: 65000,
        image: 'manicure.jpg..webp'
    },
    {
        id: 7,
        name: 'Facial',
        price: 120000,
        image: 'facial.jpg'
    },
    {
        id: 8,
        name: 'Potong Rambut',
        price: 50000,
        image: 'hair.jpg'
    }
];

// Menyimpan pesanan pelanggan
let orders = [];


// ==================================
// 2. FUNGSI DASAR
// ==================================

const el = (id) => document.getElementById(id);

function rupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(number);
}

// Membaca uang dengan atau tanpa titik
function parseRupiah(value) {
    const digits = String(value ?? '').replace(/\D/g, '');

    return digits === '' ? 0 : Number(digits);
}


// ==================================
// 3. MENAMPILKAN LAYANAN DAN FOTO
// ==================================

function renderServices() {

    el('serviceList').innerHTML = services.map(service => `
        <button
            type="button"
            class="service-card"
            data-service-id="${service.id}">

            <img
                src="${service.image}"
                alt="${service.name}"
                class="service-image"
                onerror="this.style.display='none'">

            <span class="service-name">
                ${service.name}
            </span>

            <span class="service-price">
                ${rupiah(service.price)}
            </span>

        </button>
    `).join('');
}


// ==================================
// 4. TAMBAH PESANAN
// ==================================

el('serviceList').addEventListener('click', function(event) {

    const button = event.target.closest('[data-service-id]');

    if (!button) return;

    const id = Number(button.dataset.serviceId);

    const existing = orders.find(item => item.id === id);

    if (existing) {

        existing.qty++;

    } else {

        const service = services.find(item => item.id === id);

        if (service) {
            orders.push({
                ...service,
                qty: 1
            });
        }
    }

    renderOrders();
    calculate();
});


// ==================================
// 5. MENAMPILKAN DAFTAR PESANAN
// ==================================

function renderOrders() {

    const list = el('orderList');

    if (orders.length === 0) {

        list.innerHTML = `
            <p class="empty-state">
                Belum ada layanan yang dipilih.
            </p>
        `;

        return;
    }

    list.innerHTML = orders.map(item => `
        <div class="order-item">

            <div>
                <strong>${item.name}</strong>
                <small>
                    ${item.qty} × ${rupiah(item.price)}
                </small>
            </div>

            <span class="order-price">
                ${rupiah(item.price * item.qty)}
            </span>

            <button
                type="button"
                class="remove-btn"
                data-remove-id="${item.id}">
                ×
            </button>

        </div>
    `).join('');
}


// ==================================
// 6. MENGHITUNG TOTAL DAN DISKON
// ==================================

function getTotals() {

    const subtotal = orders.reduce((sum, item) => {
        return sum + (item.price * item.qty);
    }, 0);

    const rawDiscount = Number(el('discount').value);

    const discountPercent = Number.isFinite(rawDiscount)
        ? Math.min(100, Math.max(0, rawDiscount))
        : 0;

    const discountAmount = Math.round(
        subtotal * discountPercent / 100
    );

    const total = Math.max(0, subtotal - discountAmount);

    const cash = parseRupiah(
        el('cashReceived').value
    );

    const change = Math.max(0, cash - total);

    return {
        subtotal,
        discountPercent,
        discountAmount,
        total,
        cash,
        change
    };
}


// ==================================
// 7. MENGHITUNG PEMBAYARAN
// ==================================

function calculate() {

    const t = getTotals();

    el('subtotal').textContent = rupiah(t.subtotal);

    el('discountAmount').textContent =
        rupiah(t.discountAmount);

    el('total').textContent = rupiah(t.total);

    el('change').textContent = rupiah(t.change);

    const message = el('paymentMessage');

    const canCheckout =
        orders.length > 0 &&
        t.total > 0 &&
        t.cash >= t.total;

    el('checkoutBtn').disabled = !canCheckout;

    message.className = 'payment-message';

    if (orders.length === 0) {

        message.textContent =
            'Silakan pilih layanan terlebih dahulu.';

    } else if (t.cash < t.total) {

        message.textContent =
            `Uang pembayaran masih kurang ${rupiah(t.total - t.cash)}.`;

        message.classList.add('error');

    } else {

        message.textContent =
            'Pembayaran cukup. Siap untuk checkout.';

        message.classList.add('success');
    }
}


// ==================================
// 8. MEMBUAT STRUK PEMBAYARAN
// ==================================

function buildReceipt() {

    const t = getTotals();

    const customer =
        el('customerName').value.trim() || 'Pelanggan';

    const date = new Date().toLocaleString('id-ID');

    const lines = [

        '       GLOW BEAUTY SALON',
        '        STRUK PEMBAYARAN',
        '----------------------------------------',

        `Tanggal       : ${date}`,
        `Pelanggan     : ${customer}`,

        '----------------------------------------',
        'DAFTAR PESANAN'

    ];

    orders.forEach(item => {

        lines.push(item.name);

        lines.push(
            `${item.qty} x ${rupiah(item.price)} = ${rupiah(item.qty * item.price)}`
        );

    });

    lines.push(

        '----------------------------------------',

        `Subtotal      : ${rupiah(t.subtotal)}`,
        `Diskon        : ${t.discountPercent}%`,
        `Potongan      : ${rupiah(t.discountAmount)}`,

        `TOTAL BAYAR   : ${rupiah(t.total)}`,

        `Uang diterima : ${rupiah(t.cash)}`,
        `Kembalian     : ${rupiah(t.change)}`,

        '----------------------------------------',

        'Terima kasih telah berkunjung!',
        'Semoga hari Anda menyenangkan.'

    );

    return lines.join('\r\n');
}


// ==================================
// 9. DOWNLOAD STRUK
// ==================================

function downloadReceipt() {

    const t = getTotals();

    if (
        orders.length === 0 ||
        t.cash < t.total ||
        t.total <= 0
    ) {

        alert('Periksa pesanan dan pembayaran terlebih dahulu.');

        return;
    }

    const receipt = buildReceipt();

    const blob = new Blob(
        [receipt],
        { type: 'text/plain;charset=utf-8' }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    const safeName =
        (el('customerName').value.trim() || 'pelanggan')
        .replace(/[^a-z0-9_-]/gi, '_');

    link.href = url;

    link.download =
        `struk-glow-salon-${safeName}.txt`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);

    alert('Pembayaran berhasil! Struk berhasil diunduh.');

    resetAll();
}


// ==================================
// 10. MENGHAPUS SATU PESANAN
// ==================================

el('orderList').addEventListener('click', function(event) {

    const button = event.target.closest('[data-remove-id]');

    if (!button) return;

    const id = Number(button.dataset.removeId);

    orders = orders.filter(item => item.id !== id);

    renderOrders();
    calculate();
});


// ==================================
// 11. RESET SEMUA TRANSAKSI
// ==================================

function resetAll() {

    orders = [];

    el('customerName').value = '';

    el('discount').value = '0';

    el('cashReceived').value = '';

    renderOrders();

    calculate();
}


// ==================================
// 12. EVENT TOMBOL
// ==================================

el('discount').addEventListener('input', calculate);

el('cashReceived').addEventListener('input', calculate);

el('checkoutBtn').addEventListener(
    'click',
    downloadReceipt
);

el('resetBtn').addEventListener(
    'click',
    resetAll
);

el('clearOrderBtn').addEventListener('click', function() {

    orders = [];

    renderOrders();

    calculate();
});


// ==================================
// 13. TANGGAL HARI INI
// ==================================

el('todayLabel').textContent =
    new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });


// ==================================
// 14. MENJALANKAN WEBSITE
// ==================================

renderServices();

renderOrders();

calculate();