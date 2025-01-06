const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        minLength: [1, 'Comment cannot be empty'],
        maxLength: [500, 'Comment cannot exceed 500 characters'],
        trim: true
    }
}, { timestamps: true });

const reviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movieId: {
        type: String,
        required: true,
        index: true 
    },
    movieTitle: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be a whole number'
        }
    },
    review: {
        type: String,
        required: true,
        minLength: [1, 'Review cannot be empty'],
        maxLength: [1000, 'Review cannot exceed 1000 characters'],
        trim: true
    },
    title: {
        type: String,
        maxLength: [100, 'Title cannot exceed 100 characters'],
        trim: true
    },
    recommend: {
        type: Boolean,
        default: null
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    spoilerAlert: {
        type: Boolean,
        default: false
    },
    watchedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for formatted date
reviewSchema.virtual('watchedAtFormatted').get(function() {
    return this.watchedAt.toLocaleDateString();
});

// Virtual for like count
reviewSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

// Index for efficient queriesOne review per movie per user
reviewSchema.index({ user: 1, movieId: 1 }, { unique: true });
// For sorting by date
reviewSchema.index({ createdAt: -1 }); 


// Instance method to check if a user has liked this review
reviewSchema.methods.isLikedBy = function(userId) {
    return this.likes.includes(userId);
};

// Static method to get popular reviews
reviewSchema.statics.getPopular = function(limit = 5) {
    return this.find()
        .sort({ 'likes.length': -1 })
        .limit(limit)
        .populate('user', 'username');
};

module.exports = mongoose.model("Review", reviewSchema);
