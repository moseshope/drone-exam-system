const Db = require("../models/db");
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');

exports.getAll = async (req, res) => {
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
  
    try {
      const skip = (page - 1) * limit;
      const total = await Db.countDocuments();
      const dbs = await Db.find()
      .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      return res.json({
        success: true,
        dbs,
        total,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
}

exports.delDB = async (req, res) => {
  try {
    const _id = req.query._id; // Assuming the _id is passed as a URL parameter

    const result = await Db.findByIdAndDelete(_id, {
      useFindAndModify: false, // Add this option to avoid deprecation warning
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "DB File not found",
      });
    }

    return res.json({
      success: true,
      message: "DB File successfully deleted",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete problem",
    });
  }
}

exports.backup = async (req, res) => {
    try {
      const backupDir = path.join(__dirname, '../public/db');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const fileName = `backup-${timestamp}.gz`
      const backupFile = path.join(backupDir, fileName);
      // Define the mongodump command
      const dumpCommand = `mongodump --uri="mongodb://localhost:27017/exam" --archive=${backupFile} --gzip`;

      // Execute the command
      exec(dumpCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error creating backup: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Stderr: ${stderr}`);
        }
        console.log(`Backup created successfully: ${stdout}`);
      });
      let newDB = new Db({fileName: fileName, dir: backupFile});
      await newDB.save();
      return res.json({
          status: 200,
          success: true
      });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
}

exports.restore = async (req, res) => {
  const checkCollectionsEmpty = async () => {
    const mongoUri = "mongodb://localhost:27017";
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db('exam');
  
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      if (count > 0) {
        await db.collection(collection.name).drop();
      }
    }
  
    await client.close();
    return true;
  };
  try {
    const { backupFile } = req.body;
    if (!backupFile) {
      return res.status(400).send('Backup file is required');
    }
    const isEmpty = await checkCollectionsEmpty();
    if (!isEmpty) {
      return res.status(400).send('Restore not possible: Target collections are not empty.');
    }
    const restoreCommand = `mongorestore --uri="mongodb://localhost:27017/exam" --archive=${backupFile} --gzip`;

    // Execute the command
    exec(restoreCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error restoring backup: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
      }
      console.log(`Restore completed successfully: ${stdout}`);
    });
    return res.json({
      status: 200,
      success: true
  });
  } catch (err) {
    return res.status(500).json({
        success: false,
        error: err.message
    });
}

}