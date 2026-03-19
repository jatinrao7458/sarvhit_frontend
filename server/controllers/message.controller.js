const Conversation = require('../models/Conversation');
const User = require('../models/User');

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'firstName lastName email userType profileImage')
      .populate('lastMessage.senderId', 'firstName lastName profileImage')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message,
    });
  }
};

exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const conversation = await Conversation.findById(conversationId)
      .populate('messages.senderId', 'firstName lastName email profileImage')
      .populate('participants', 'firstName lastName email userType profileImage');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    if (!conversation.participants.some((p) => p._id.toString() === userId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Mark as read
    conversation.unreadCount.set(userId.toString(), 0);
    await conversation.save();

    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation messages',
      error: error.message,
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required',
      });
    }

    let conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    if (!conversation.participants.some((p) => p.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const newMessage = {
      senderId: userId,
      text,
      createdAt: new Date(),
    };

    conversation.messages.push(newMessage);
    conversation.lastMessage = {
      text,
      senderId: userId,
      timestamp: new Date(),
    };

    // Mark as unread for other participants
    conversation.participants.forEach((participantId) => {
      if (participantId.toString() !== userId.toString()) {
        const currentUnread = conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(participantId.toString(), currentUnread + 1);
      }
    });

    await conversation.save();
    await conversation.populate('messages.senderId', 'firstName lastName profileImage');

    res.json({
      success: true,
      message: 'Message sent',
      conversation,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
};

exports.startConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user.userId;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required',
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
    });

    if (conversation) {
      return res.json({
        success: true,
        message: 'Conversation already exists',
        conversation,
      });
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [userId, recipientId],
      messages: [],
      unreadCount: new Map(),
    });

    await conversation.save();
    await conversation.populate('participants', 'firstName lastName email userType');

    res.status(201).json({
      success: true,
      message: 'Conversation started',
      conversation,
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting conversation',
      error: error.message,
    });
  }
};
