/* =========================================================
   PUBLIC INFRASTRUCTURE DAMAGE REPORTER
   JavaScript (Complete & Upgraded)
========================================================= */


/* =========================================================
   LOGIN DETAILS
========================================================= */

const USERS = {
    citizen: {
        username: "citizen",
        password: "citizen123"
    },

    department: {
        username: "admin",
        password: "admin123"
    }
};


/* =========================================================
   CURRENT LOGIN TYPE
========================================================= */

let currentUserType = "citizen";


/* =========================================================
   LOAD COMPLAINTS FROM LOCAL STORAGE
========================================================= */

let complaints =
    JSON.parse(localStorage.getItem("civicComplaints")) || [];


/* =========================================================
   LOGIN TYPE
========================================================= */

function showLoginType(type) {

    currentUserType = type;

    const citizenTab =
        document.getElementById("citizenTab");

    const departmentTab =
        document.getElementById("departmentTab");

    if (type === "citizen") {

        citizenTab.classList.add("active");

        departmentTab.classList.remove("active");

    } else {

        departmentTab.classList.add("active");

        citizenTab.classList.remove("active");

    }

    document.getElementById("loginError")
        .classList.add("d-none");
}


/* =========================================================
   LOGIN
========================================================= */

document
    .getElementById("loginForm")
    .addEventListener("submit", function (event) {

        event.preventDefault();

        const username =
            document.getElementById("username").value.trim();

        const password =
            document.getElementById("password").value;

        const user =
            USERS[currentUserType];

        if (
            username === user.username &&
            password === user.password
        ) {

            document
                .getElementById("loginPage")
                .classList.add("d-none");


            if (currentUserType === "citizen") {

                document
                    .getElementById("citizenDashboard")
                    .classList.remove("d-none");

                loadCitizenDashboard();

            } else {

                document
                    .getElementById("departmentDashboard")
                    .classList.remove("d-none");

                loadDepartmentDashboard();

            }

        } else {

            document
                .getElementById("loginError")
                .classList.remove("d-none");

        }

    });


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    document
        .getElementById("citizenDashboard")
        .classList.add("d-none");

    document
        .getElementById("departmentDashboard")
        .classList.add("d-none");

    document
        .getElementById("loginPage")
        .classList.remove("d-none");


    document
        .getElementById("loginForm")
        .reset();


    document
        .getElementById("loginError")
        .classList.add("d-none");


    showLoginType("citizen");
}


/* =========================================================
   SHOW SECTION
========================================================= */

function showSection(id) {

    document
        .getElementById(id)
        .classList.remove("d-none");
}

function openReportSection() {
    showSection('reportSection');
    setTimeout(() => {
        initMap();
    }, 200);
}


/* =========================================================
   HIDE SECTION
========================================================= */

function hideSection(id) {

    document
        .getElementById(id)
        .classList.add("d-none");
}


/* =========================================================
   GENERATE COMPLAINT ID
========================================================= */

function generateComplaintId() {

    const year = new Date().getFullYear();

    const number =
        complaints.length + 1;

    return (
        "PIR-" +
        year +
        "-" +
        String(number).padStart(4, "0")
    );
}


/* =========================================================
   CURRENT DATE
========================================================= */

function getCurrentDate() {

    const date = new Date();

    return date.toLocaleDateString("en-IN");

}


/* =========================================================
   PHOTO PREVIEW
========================================================= */

document
    .getElementById("photo")
    .addEventListener("change", function () {

        const file = this.files[0];

        const preview =
            document.getElementById("photoPreview");

        preview.innerHTML = "";

        if (!file) {
            return;
        }

        const reader =
            new FileReader();

        reader.onload = function (event) {

            preview.innerHTML = `
                <img
                    src="${event.target.result}"
                    alt="Complaint Photo">
            `;

        };

        reader.readAsDataURL(file);

    });


/* =========================================================
   INTERACTIVE MAP & GEOLOCATION
========================================================= */

let map = null;
let marker = null;

function initMap(lat = 16.9891, lng = 81.7832) {
    if (!map) {
        map = L.map('map').setView([lat, lng], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        map.on('click', function(e) {
            setMapPin(e.latlng.lat, e.latlng.lng);
        });
    } else {
        map.invalidateSize();
        map.setView([lat, lng], 14);
    }
    setMapPin(lat, lng);
}

function setMapPin(lat, lng) {
    document.getElementById("latitude").value = lat.toFixed(6);
    document.getElementById("longitude").value = lng.toFixed(6);

    if (marker) {
        marker.setLatLng([lat, lng]);
    } else {
        marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        marker.on('dragend', function(event) {
            const pos = marker.getLatLng();
            document.getElementById("latitude").value = pos.lat.toFixed(6);
            document.getElementById("longitude").value = pos.lng.toFixed(6);
        });
    }
}

function getLocation() {

    if (!navigator.geolocation) {

        alert(
            "Geolocation is not supported by this browser."
        );

        return;
    }


    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            initMap(latitude, longitude);


            alert(
                "Location captured successfully on the map!"
            );

        },


        function (error) {

            alert(
                "Unable to get your location. Please click on the map manually."
            );

        }

    );

}


/* =========================================================
   REPORT FORM
========================================================= */

document
    .getElementById("reportForm")
    .addEventListener("submit", function (event) {

        event.preventDefault();


        const category =
            document.getElementById("category").value;

        const priority =
            document.getElementById("priority").value;

        const location =
            document.getElementById("location").value.trim();

        const latitude =
            document.getElementById("latitude").value;

        const longitude =
            document.getElementById("longitude").value;

        const description =
            document.getElementById("description").value.trim();

        const photoFile =
            document.getElementById("photo").files[0];


        if (
            !category ||
            !priority ||
            !location ||
            !description
        ) {

            alert(
                "Please fill all required fields."
            );

            return;
        }


        /* Create complaint */

        const complaint = {

            id: generateComplaintId(),

            category: category,

            priority: priority,

            location: location,

            latitude: latitude,

            longitude: longitude,

            description: description,

            status: "Submitted",

            date: getCurrentDate(),

            citizen: "citizen",

            photo: ""

        };


        /* =================================================
           SAVE PHOTO
        ================================================= */

        if (photoFile) {

            const reader =
                new FileReader();

            reader.onload = function (event) {

                complaint.photo =
                    event.target.result;

                saveComplaint(complaint);

            };

            reader.readAsDataURL(photoFile);

        } else {

            saveComplaint(complaint);

        }

    });


/* =========================================================
   SAVE COMPLAINT
========================================================= */

function saveComplaint(complaint) {

    complaints.push(complaint);

    localStorage.setItem(
        "civicComplaints",
        JSON.stringify(complaints)
    );


    alert(
        "Complaint submitted successfully!\n\nComplaint ID: " +
        complaint.id
    );


    document
        .getElementById("reportForm")
        .reset();


    document
        .getElementById("photoPreview")
        .innerHTML = "";


    hideSection("reportSection");


    loadCitizenDashboard();

}


/* =========================================================
   CITIZEN DASHBOARD
========================================================= */

function loadCitizenDashboard() {

    const myComplaints =
        complaints.filter(
            complaint =>
                complaint.citizen === "citizen"
        );


    /* Statistics */

    document
        .getElementById("citizenTotal")
        .textContent =
        myComplaints.length;


    document
        .getElementById("citizenPending")
        .textContent =
        myComplaints.filter(
            complaint =>
                complaint.status !== "Resolved"
        ).length;


    document
        .getElementById("citizenResolved")
        .textContent =
        myComplaints.filter(
            complaint =>
                complaint.status === "Resolved"
        ).length;


    displayCitizenComplaints(
        myComplaints
    );

}


/* =========================================================
   DISPLAY CITIZEN COMPLAINTS
========================================================= */

function displayCitizenComplaints(data) {

    const container =
        document.getElementById(
            "citizenComplaints"
        );


    if (data.length === 0) {

        container.innerHTML = `
            <div class="text-center py-5">
                <i
                    class="bi bi-inbox"
                    style="font-size:50px;color:#adb5bd;">
                </i>

                <h5 class="mt-3">
                    No complaints yet
                </h5>

                <p class="text-muted">
                    Report an infrastructure problem to get started.
                </p>
            </div>
        `;

        return;
    }


    let html = `
        <table class="table table-hover align-middle">

            <thead>

                <tr>
                    <th>Complaint ID</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Priority</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>

            </thead>

            <tbody>
    `;


    data.forEach(complaint => {

        html += `

            <tr>

                <td>
                    <strong>
                        ${complaint.id}
                    </strong>
                </td>

                <td>
                    ${complaint.category}
                </td>

                <td>
                    ${complaint.location}
                </td>

                <td>
                    ${getPriorityHTML(
                        complaint.priority
                    )}
                </td>

                <td>
                    ${complaint.date}
                </td>

                <td>
                    ${getStatusHTML(
                        complaint.status
                    )}
                </td>

                <td>

                    <button
                        class="btn btn-sm btn-outline-primary"
                        onclick="viewComplaint('${complaint.id}')">

                        <i class="bi bi-eye"></i>
                        View

                    </button>

                </td>

            </tr>

        `;

    });


    html += `
            </tbody>
        </table>
    `;


    container.innerHTML = html;

}


/* =========================================================
   DEPARTMENT DASHBOARD
========================================================= */

function loadDepartmentDashboard() {

    updateDepartmentStatistics();

    displayDepartmentComplaints();

    updateCharts();

}


/* =========================================================
   DEPARTMENT STATISTICS
========================================================= */

function updateDepartmentStatistics() {

    const total =
        complaints.length;


    const pending =
        complaints.filter(
            complaint =>
                complaint.status === "Submitted" ||
                complaint.status === "Under Review"
        ).length;


    const progress =
        complaints.filter(
            complaint =>
                complaint.status === "Assigned" ||
                complaint.status === "In Progress"
        ).length;


    const resolved =
        complaints.filter(
            complaint =>
                complaint.status === "Resolved"
        ).length;


    document
        .getElementById("totalReports")
        .textContent = total;


    document
        .getElementById("pendingReports")
        .textContent = pending;


    document
        .getElementById("progressReports")
        .textContent = progress;


    document
        .getElementById("resolvedReports")
        .textContent = resolved;

}


/* =========================================================
   DISPLAY DEPARTMENT COMPLAINTS
========================================================= */

function displayDepartmentComplaints() {

    const search =
        document
            .getElementById("searchComplaints")
            .value
            .toLowerCase();


    const category =
        document
            .getElementById("filterCategory")
            .value;


    const status =
        document
            .getElementById("filterStatus")
            .value;


    const filtered =
        complaints.filter(complaint => {

            const matchesSearch =
                complaint.id
                    .toLowerCase()
                    .includes(search) ||

                complaint.category
                    .toLowerCase()
                    .includes(search) ||

                complaint.location
                    .toLowerCase()
                    .includes(search);


            const matchesCategory =
                category === "All" ||
                complaint.category === category;


            const matchesStatus =
                status === "All" ||
                complaint.status === status;


            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );

        });


    const table =
        document.getElementById(
            "departmentComplaints"
        );


    if (filtered.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center py-4">

                    No complaints found.

                </td>

            </tr>

        `;

        return;
    }


    let html = "";


    filtered.forEach(complaint => {

        html += `

            <tr>

                <td>
                    <strong>
                        ${complaint.id}
                    </strong>
                </td>

                <td>
                    ${complaint.category}
                </td>

                <td>
                    ${complaint.location}
                </td>

                <td>
                    ${getPriorityHTML(
                        complaint.priority
                    )}
                </td>

                <td>
                    ${complaint.date}
                </td>

                <td>
                    ${getStatusHTML(
                        complaint.status
                    )}
                </td>

                <td>

                    <button
                        class="btn btn-sm btn-primary me-1"
                        onclick="viewComplaint('${complaint.id}')">

                        <i class="bi bi-eye"></i>

                    </button>

                    <button
                        class="btn btn-sm btn-success"
                        onclick="updateComplaintStatus('${complaint.id}')">

                        <i class="bi bi-pencil"></i>

                    </button>

                </td>

            </tr>

        `;

    });


    table.innerHTML = html;

}


/* =========================================================
   STATUS HTML
========================================================= */

function getStatusHTML(status) {

    let className = "status-submitted";


    if (status === "Under Review") {

        className = "status-review";

    } else if (status === "Assigned") {

        className = "status-assigned";

    } else if (status === "In Progress") {

        className = "status-progress";

    } else if (status === "Resolved") {

        className = "status-resolved";

    }


    return `
        <span class="status-badge ${className}">
            ${status}
        </span>
    `;

}


/* =========================================================
   PRIORITY HTML
========================================================= */

function getPriorityHTML(priority) {

    let className = "priority-low";


    if (priority === "High") {

        className = "priority-high";

    } else if (priority === "Medium") {

        className = "priority-medium";

    }


    return `
        <span class="${className}">
            ${priority}
        </span>
    `;

}


/* =========================================================
   VIEW COMPLAINT
========================================================= */

function viewComplaint(id) {

    const complaint =
        complaints.find(
            item => item.id === id
        );


    if (!complaint) {
        return;
    }


    let photoHTML = "";


    if (complaint.photo) {

        photoHTML = `

            <div class="mt-3">

                <strong>
                    Reported Photo
                </strong>

                <br><br>

                <img
                    src="${complaint.photo}"
                    class="complaint-photo"
                    alt="Complaint Photo">

            </div>

        `;

    }


    let locationHTML = "";


    if (
        complaint.latitude &&
        complaint.longitude
    ) {

        locationHTML = `

            <div class="complaint-detail">

                <strong>
                    GPS:
                </strong>

                ${complaint.latitude},
                ${complaint.longitude}

            </div>

        `;

    }


    document
        .getElementById("complaintDetails")
        .innerHTML = `

            <div class="complaint-detail">
                <strong>Complaint ID:</strong>
                ${complaint.id}
            </div>

            <div class="complaint-detail">
                <strong>Category:</strong>
                ${complaint.category}
            </div>

            <div class="complaint-detail">
                <strong>Location:</strong>
                ${complaint.location}
            </div>

            ${locationHTML}

            <div class="complaint-detail">
                <strong>Priority:</strong>
                ${getPriorityHTML(
                    complaint.priority
                )}
            </div>

            <div class="complaint-detail">
                <strong>Date:</strong>
                ${complaint.date}
            </div>

            <div class="complaint-detail">
                <strong>Status:</strong>
                ${getStatusHTML(
                    complaint.status
                )}
            </div>

            <div class="complaint-detail">

                <strong>Description:</strong>

                <p class="mt-2">
                    ${complaint.description}
                </p>

            </div>

            ${photoHTML}

        `;


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "complaintModal"
            )
        );


    modal.show();

}


/* =========================================================
   UPDATE COMPLAINT STATUS
========================================================= */

function updateComplaintStatus(id) {

    const complaint =
        complaints.find(
            item => item.id === id
        );


    if (!complaint) {
        return;
    }


    const newStatus =
        prompt(

            `Update status for ${id}.\n\n` +

            `Enter one of:\n` +

            `Submitted\n` +

            `Under Review\n` +

            `Assigned\n` +

            `In Progress\n` +

            `Resolved`,

            complaint.status

        );


    if (!newStatus) {
        return;
    }


    const validStatuses = [

        "Submitted",
        "Under Review",
        "Assigned",
        "In Progress",
        "Resolved"

    ];


    if (
        !validStatuses.includes(newStatus)
    ) {

        alert(
            "Invalid status.\nPlease enter one of the listed statuses exactly."
        );

        return;

    }


    complaint.status =
        newStatus;


    localStorage.setItem(
        "civicComplaints",
        JSON.stringify(complaints)
    );


    loadDepartmentDashboard();

    alert(
        "Complaint status updated successfully."
    );

}


/* =========================================================
   FILTER EVENTS
========================================================= */

document
    .getElementById("searchComplaints")
    .addEventListener(
        "input",
        displayDepartmentComplaints
    );


document
    .getElementById("filterCategory")
    .addEventListener(
        "change",
        displayDepartmentComplaints
    );


document
    .getElementById("filterStatus")
    .addEventListener(
        "change",
        displayDepartmentComplaints
    );


/* =========================================================
   PROFESSIONAL ENHANCED CHARTS
========================================================= */

let categoryChart = null;

let statusChart = null;


function updateCharts() {

    updateCategoryChart();

    updateStatusChart();

}


/* =========================================================
   CATEGORY CHART
========================================================= */

function updateCategoryChart() {

    const counts = {};


    complaints.forEach(
        complaint => {

            if (
                !counts[complaint.category]
            ) {

                counts[complaint.category] = 0;

            }

            counts[complaint.category]++;

        }
    );


    const canvas =
        document.getElementById(
            "categoryChart"
        );


    if (categoryChart) {

        categoryChart.destroy();

    }


    categoryChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels: Object.keys(counts),

                datasets: [

                    {

                        label:
                            "Reports",

                        data: Object.values(counts),

                        backgroundColor: "#2563eb",

                        borderRadius: 8,

                        barThickness: 'flex',

                        maxBarThickness: 45

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: true,

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {

                        backgroundColor: '#0f172a',

                        titleFont: { size: 14, weight: 'bold' },

                        bodyFont: { size: 13 },

                        padding: 12,

                        cornerRadius: 8

                    }

                },

                scales: {

                    x: {

                        grid: { display: false },

                        ticks: { font: { size: 12 }, color: '#64748b' }

                    },

                    y: {

                        beginAtZero: true,

                        ticks: {

                            precision: 0,

                            font: { size: 12 },

                            color: '#64748b'

                        },

                        grid: {

                            color: '#f1f5f9',

                            borderDash: [4, 4]

                        }

                    }

                }

            }

        });

}


/* =========================================================
   STATUS CHART
========================================================= */

function updateStatusChart() {

    const statuses = [

        "Submitted",
        "Under Review",
        "Assigned",
        "In Progress",
        "Resolved"

    ];


    const values =
        statuses.map(

            status =>

                complaints.filter(
                    complaint =>
                        complaint.status === status
                ).length

        );


    const canvas =
        document.getElementById(
            "statusChart"
        );


    if (statusChart) {

        statusChart.destroy();

    }


    statusChart =
        new Chart(canvas, {

            type: "doughnut",

            data: {

                labels: statuses,

                datasets: [

                    {

                        data: values,

                        backgroundColor: [

                            "#0369a1", // Submitted
                            "#d97706", // Under Review
                            "#475569", // Assigned
                            "#0891b2", // In Progress
                            "#059669"  // Resolved

                        ],

                        borderWidth: 3,

                        borderColor: "#ffffff",

                        hoverOffset: 6

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: true,

                cutout: '68%',

                plugins: {

                    legend: {

                        position: 'bottom',

                        labels: {

                            boxWidth: 12,

                            boxHeight: 12,

                            borderRadius: 4,

                            font: { size: 12, weight: '500' },

                            color: '#334155',

                            padding: 20

                        }

                    },

                    tooltip: {

                        backgroundColor: '#0f172a',

                        titleFont: { size: 14, weight: 'bold' },

                        bodyFont: { size: 13 },

                        padding: 12,

                        cornerRadius: 8

                    }

                }

            }

        });

}


/* =========================================================
   INITIALIZATION
========================================================= */

showLoginType("citizen");