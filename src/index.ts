import express from "express";
import helmet from "helmet";
import cors from "cors";
import "dotenv/config"

import authRoutes from "./routes/auth.routes"
import staffRoutes from "./routes/staff.routes"
import doctorRoutes from "./routes/doctor.routes"
import nurseRoutes from "./routes/nurse.routes"
// import wardRoutes from "./routes/ward.routes"
// import bedRoutes from "./routes/bed.routes"
// import departmentRoutes from "./routes/department.routes"
// import treatmentRoutes from "./routes/treatment.routes"
// import patientRoutes from "./routes/patient.routes"

const app = express()
const port = process.env.PORT || 5555;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/nurses", nurseRoutes);

// app.use("/api/wards", wardRoutes);
// app.use("/api/beds", bedRoutes);
// app.use("/api/departments", departmentRoutes);
// app.use("/api/treatments", treatmentRoutes);
// app.use("/api/patients", patientRoutes);

app.listen(port, () => {
  console.log(`Express is running on port: ${port}`)
});