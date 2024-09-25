import { Job } from "../models/job.model.js";

// Create a new job
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;

        const userId = req.id;

        // Validate request data
        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }

        // Create job
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","), // Convert comma-separated requirements into array
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId,
            created_by: userId
        });

        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.error("Error creating job:", error); // Log more detailed error message
        return res.status(500).json({ message: "Failed to create a new job." });
    }
};

// Get all jobs with optional search by keyword
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";

        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ]
        };

        const jobs = await Job.find(query).populate({ path: "company" }).sort({ createdAt: -1 });

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({ message: "Jobs are not found!", success: false });
        }

        return res.status(200).json({ jobs, success: true });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return res.status(500).json({ message: "Failed to get jobs." });
    }
};

// Get job by ID
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;

        const job = await Job.findById(jobId).populate({
            path: "applications",
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        return res.status(200).json({ success: true, job });
    } catch (error) {
        console.error("Error fetching job by ID:", error);
        return res.status(500).json({ message: "Failed to get job." });
    }
};

// Get jobs created by logged-in admin user
export const getJobByLoggedAdminUser = async (req, res) => {
    try {
        const userId = req.id;

        const jobs = await Job.find({ created_by: userId })
            .populate({ path: 'company' })
            .sort({ createdAt: -1 });  // Apply sorting here

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({ message: "Jobs are not found", success: false });
        }

        return res.status(200).json({ jobs, success: true });
    } catch (error) {
        console.error("Error fetching jobs for admin user:", error);
        return res.status(500).json({ message: "Failed to get jobs for the admin user." });
    }
};
