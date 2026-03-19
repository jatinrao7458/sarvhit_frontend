const Connection = require('../models/Connection');
const User = require('../models/User');

exports.sendConnectionRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user.userId;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required',
      });
    }

    if (userId === recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot connect with yourself',
      });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { userId, connectedUserId: recipientId },
        { userId: recipientId, connectedUserId: userId },
      ],
    });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: 'Connection already exists',
      });
    }

    const connection = new Connection({
      userId,
      connectedUserId: recipientId,
      status: 'pending',
    });

    await connection.save();

    res.status(201).json({
      success: true,
      message: 'Connection request sent',
      connection,
    });
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending connection request',
      error: error.message,
    });
  }
};

exports.acceptConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.userId;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found',
      });
    }

    if (connection.connectedUserId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to accept this connection',
      });
    }

    connection.status = 'connected';
    await connection.save();

    // Create reverse connection
    const reverseConnection = new Connection({
      userId: connection.connectedUserId,
      connectedUserId: connection.userId,
      status: 'connected',
    });

    await reverseConnection.save();

    res.json({
      success: true,
      message: 'Connection accepted',
      connection,
    });
  } catch (error) {
    console.error('Error accepting connection:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting connection',
      error: error.message,
    });
  }
};

exports.getConnections = async (req, res) => {
  try {
    const userId = req.user.userId;

    const connections = await Connection.find({
      userId,
      status: 'connected',
    })
      .populate('connectedUserId', 'firstName lastName email userType city')
      .sort({ connectedAt: -1 });

    res.json({
      success: true,
      connections,
      count: connections.length,
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching connections',
      error: error.message,
    });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await Connection.find({
      connectedUserId: userId,
      status: 'pending',
    })
      .populate('userId', 'firstName lastName email userType city')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests,
      count: requests.length,
    });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending requests',
      error: error.message,
    });
  }
};

exports.blockConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;

    const connection = await Connection.findByIdAndUpdate(
      connectionId,
      { status: 'blocked' },
      { new: true }
    );

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found',
      });
    }

    res.json({
      success: true,
      message: 'Connection blocked',
      connection,
    });
  } catch (error) {
    console.error('Error blocking connection:', error);
    res.status(500).json({
      success: false,
      message: 'Error blocking connection',
      error: error.message,
    });
  }
};
