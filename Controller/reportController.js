
const cities = require("../Models/citySchema");
const users = require("../Models/userSchema");
const events = require("../Models/eventSchema")
const reports = require("../Models/reportSchema")
const notes = require("../Models/noteSchema")
const circles = require("../Models/circleSchema")


// Function to get the total count of circles , cities , notes , users , events
exports.getTotalCount = async (req, res) => {
  try {
    const userId = req.payload;
    const User = await users.findById(userId)

    if (User.isUserAdmin == true) {

      const circleCount = await circles.countDocuments();
      const cityCount = await cities.countDocuments();
      const userCount = await users.countDocuments(); // Mongoose method to count documents
      const eventCount = await events.countDocuments(); // Mongoose method to count documents
      const noteCount = await notes.countDocuments(); // Mongoose method to count documents
      res.status(200).json({
        circleCount,
        cityCount,
        userCount,
        eventCount,
        noteCount
      });

    }else{
      res.status(401).json({ message: 'Authentication failed' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching Total count' });
  }
};



// Function to add a new report
exports.addReport = async (req, res) => {
  try {
    // Get the user ID of the reporter from the request header
    const reporterId = req.payload; // Assuming this comes from a token or some auth middleware

    // Extract report data from the request body
    const { reportType, reportAgainstUserId, reportNoteId, reportEventId, reportDetails } = req.body;

    // Validate that required data is provided
    if (!reportType || !reportDetails) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Fetch the reporter's details
    const reporter = await users.findById(reporterId);
    if (!reporter) {
      return res.status(404).json({ message: 'Reporter not found' });
    }

    let reportQuery = {};
    let reportData = {};
    let reportedUserName, noteTitle, eventTitle;

    // Determine the type of report and set up the query and data accordingly
    if (reportType === 'user' && reportAgainstUserId) {
      const reportedUser = await users.findById(reportAgainstUserId);
      if (!reportedUser) {
        return res.status(404).json({ message: 'Reported user not found' });
      }
      reportedUserName = reportedUser.userName; // Assuming 'name' field exists in users schema
      reportQuery = { reportType: 'user', reportAgainstUserId };
      reportData = { reportAgainstUserId, reportedUserName };
    } else if (reportType === 'note' && reportNoteId) {
      const note = await notes.findById(reportNoteId);
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }
      noteTitle = note.noteTitle; // Assuming 'title' field exists in notes schema
      reportQuery = { reportType: 'note', reportNoteId };
      reportData = { reportNoteId, noteTitle };
    } else if (reportType === 'event' && reportEventId) {
      const event = await events.findById(reportEventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      eventTitle = event.eventTitle; // Assuming 'title' field exists in events schema
      reportQuery = { reportType: 'event', reportEventId };
      reportData = { reportEventId, eventTitle };
    } else {
      return res.status(400).json({ message: 'Invalid report type or missing target ID' });
    }

    // Find existing report with the same target (user, note, or event)
    let report = await reports.findOne(reportQuery);

    // Prepare the data to be added to reportCompliance
    const complianceData = {
      userId: reporterId,
      userName: reporter.userName, // Adding reporter's name
      details: reportDetails,
    };

    if (report) {
      // If report already exists
      report.reportCompliance.push(complianceData);

      // Check if the report was resolved, if so, mark as unresolved
      if (report.reportResolve === true) {
        report.reportResolve = false;
      }
    }else {
      // If no report exists, create a new report document
      report = new reports({
        reportType,
        ...reportData,
        reportCompliance: [complianceData],
        reporterName: reporter.userName,
        reportResolve: false, // Initialize as unresolved
      });
    }

    // Save the report document
    await report.save();

    res.status(200).json({ message: 'Report added successfully', report });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding report' });
  }
};



// Function to get unresolved reports, grouped by type and sorted by "updatedAt"
exports.getReports = async (req, res) => {
  try {
    // Fetch all unresolved reports
    const unresolvedReports = await reports.find({ reportResolve: false }).sort({ updatedAt: 1 });

    // Group reports by type
    const groupedReports = {
      userReports: [],
      noteReports: [],
      eventReports: [],
    };

    // Separate the reports by their type
    unresolvedReports.forEach(report => {
      switch (report.reportType) {
        case 'user':
          groupedReports.userReports.push(report);
          break;
        case 'note':
          groupedReports.noteReports.push(report);
          break;
        case 'event':
          groupedReports.eventReports.push(report);
          break;
        default:
          break;
      }
    });

    // Respond with the grouped and sorted reports
    res.status(200).json(groupedReports);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

// Function to resolve a report
exports.resolveReport = async (req, res) => {
  try {
    // Get the report ID from the request parameters
    const { reportId } = req.params;

    // Find the report by ID
    const report = await reports.findById(reportId);

    // Check if the report exists
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if the report is already resolved
    if (report.reportResolve) {
      return res.status(400).json({ message: 'Report is already resolved' });
    }

    // Mark the report as resolved
    report.reportResolve = true;

    // Save the updated report
    await report.save();

    res.status(200).json({ message: 'Report resolved successfully', report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error resolving report' });
  }
};
