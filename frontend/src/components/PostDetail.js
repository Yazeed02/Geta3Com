import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  CssBaseline,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  CircularProgress,
  Link,
  Alert,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { fetchPostDetails, fetchComments, addComment, editComment, deleteComment, addFavorite, removeFavorite, deleteGeta3, editPost, fetchUser } from '../api';
import { useTranslation } from 'react-i18next';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [editPostData, setEditPostData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteError, setFavoriteError] = useState(null);
  const [commentError, setCommentError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [relatedImgIndexes, setRelatedImgIndexes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userData = await fetchUser();
        setUser(userData);

        const postData = await fetchPostDetails(postId);
        const { geta3, isFavorited, relatedPosts } = postData;
        setPost(geta3);
        setIsFavorited(isFavorited);
        setRelatedPosts(relatedPosts);

        setRelatedImgIndexes(new Array(relatedPosts.length).fill(0));

        const postComments = await fetchComments(postId);
        setComments(postComments);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(t('errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId, t]);

  const handleToggleFavorite = async () => {

    if (!user) {
      setFavoriteError(t('loginPrompt'));
      return;
    }

    try {
      let response;
      if (isFavorited) {
        response = await removeFavorite(postId);
      } else {
        response = await addFavorite(postId);
      }

      if (response && response.favoritesCount !== undefined) {
        setIsFavorited(!isFavorited);
        setPost({ ...post, favoritesCount: response.favoritesCount });
        setFavoriteError(null);
      } else {
        setFavoriteError(t('error'));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setFavoriteError(t('error'));
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      setCommentError(t('loginPrompt'));
      return;
    }
    try {
      const addedComment = await addComment(postId, { text: newComment });
      setComments([...comments, addedComment]);
      setNewComment('');
      setCommentError(null);
    } catch (error) {
      console.error('Error adding comment:', error);
      setCommentError(t('error'));
    }
  };

  const handleEditComment = async (commentId) => {
    try {
      const editedComment = await editComment(postId, commentId, { text: editCommentText });
      setComments(comments.map(comment => comment._id === commentId ? editedComment : comment));
      setEditCommentId(null);
      setEditCommentText('');
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(postId, commentId);
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeletePost = async () => {
    try {
      await deleteGeta3(postId);
      navigate('/'); // Redirect to home page after deleting
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleGoToLocation = () => {
    if (post.Location) {
      window.open(post.Location, '_blank');
    }
  };

  const handleEditPost = async () => {
    try {
      const updatedPost = await editPost(postId, editPostData);
      setPost(updatedPost);  // Update the post with the edited data
      setEditPostData({}); // Clear the editing state
      setIsEditing(false);   // Exit editing mode
    } catch (error) {
      console.error('Error editing post:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditPostData({}); // Discard changes and exit edit mode
  };

  const handleRelatedPostClick = (relatedPostId) => {
    navigate(`/posts/${relatedPostId}`);
  };

  const nextImage = () => {
    if (post && post.imgs && post.imgs.length > 1) {
      setImgIndex((prevIndex) => (prevIndex + 1) % post.imgs.length);
    }
  };

  const prevImage = () => {
    if (post && post.imgs && post.imgs.length > 1) {
      setImgIndex((prevIndex) => (prevIndex - 1 + post.imgs.length) % post.imgs.length);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography variant="h6" color="error">{error}</Typography>;
  }

  if (!post || !post.User) {
    return <Typography variant="h6">{t('noResultsFound')}</Typography>;
  }

  return (
    <Container component="main" sx={{ flexGrow: 1, p: 3 }}>
      <CssBaseline />
      <Grid container spacing={3}>
      

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box position="relative" display="flex" flexDirection="column" alignItems="center">
                {post.imgs && post.imgs.length > 1 && (
                  <>
                    <IconButton
                      onClick={prevImage}
                      sx={{
                        position: 'absolute',
                        left: 10,
                        zIndex: 10,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                      }}
                    >
                      <ArrowBackIosIcon />
                    </IconButton>
                    <IconButton
                      onClick={nextImage}
                      sx={{
                        position: 'absolute',
                        right: 10,
                        zIndex: 10,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                      }}
                    >
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </>
                )}

                {post.imgs && (
                  <img
                    src={post.imgs[imgIndex]}
                    alt={`${post.Title} image ${imgIndex + 1}`}
                    style={{ width: '80%', height: 'auto', borderRadius: '8px', margin: '10px 0' }}
                  />
                )}
                {post.imgs && post.imgs.length > 1 && (
                  <Typography align="center" variant="body2" color="textSecondary">
                    {imgIndex + 1} / {post.imgs.length}
                  </Typography>
                )}
              </Box>

              {!isEditing ? (
                <>
                  <Typography variant="h3" sx={{ mt: 2 }} gutterBottom>{post.Title}</Typography>
                  <Typography variant="h6" paragraph>{post.Description}</Typography>
                  <Typography variant="h6"><strong>{t('condition')}:</strong> {post.condition}</Typography>
                  <Typography variant="h6"><strong>{t('carModel')}:</strong> {post.carModel}</Typography>
                  <Typography variant="h6"><strong>{t('carManufacturingYear')}:</strong> {post.carManufacturingYear}</Typography>
                  <Typography variant="h6"><strong>{t('brand')}:</strong> {post.brand}</Typography>
                  <Typography variant="h6"><strong>{t('price')}:</strong> {post.price} JOD</Typography>
                  <Typography variant="h6"><strong>{t('relatedLink')}:</strong> <Link href={post.Related_link} target="_blank" rel="noopener noreferrer">{post.Related_link}</Link></Typography>
                  <Typography variant="h6"><strong>{t('favoritesCount')}:</strong> {post.favoritesCount}</Typography>
                  <Typography variant="h6"><strong>{t('created_at')}:</strong> {post.created_at}</Typography>
                </>
              ) : (
                <>
                  <TextField
                    label={t('title')}
                    value={editPostData.Title || post.Title}
                    onChange={(e) => setEditPostData({ ...editPostData, Title: e.target.value })}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label={t('description')}
                    value={editPostData.Description || post.Description}
                    onChange={(e) => setEditPostData({ ...editPostData, Description: e.target.value })}
                    fullWidth
                    multiline
                    rows={4}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label={t('condition')}
                    value={editPostData.condition || post.condition}
                    onChange={(e) => setEditPostData({ ...editPostData, condition: e.target.value })}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label={t('carModel')}
                    value={editPostData.carModel || post.carModel}
                    onChange={(e) => setEditPostData({ ...editPostData, carModel: e.target.value })}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label={t('carManufacturingYear')}
                    value={editPostData.carManufacturingYear || post.carManufacturingYear}
                    onChange={(e) => setEditPostData({ ...editPostData, carManufacturingYear: e.target.value })}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label={t('brand')}
                    value={editPostData.brand || post.brand}
                    onChange={(e) => setEditPostData({ ...editPostData, brand: e.target.value })}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label={t('price')}
                    value={editPostData.price || post.price}
                    onChange={(e) => setEditPostData({ ...editPostData, price: e.target.value })}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label={t('relatedLink')}
                    value={editPostData.Related_link || post.Related_link}
                    onChange={(e) => setEditPostData({ ...editPostData, Related_link: e.target.value })}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <Box mt={2}>
                    <Button
                      onClick={handleEditPost}
                      variant="contained"
                      sx={{ backgroundColor: '#000000', color: 'white', '&:hover': { backgroundColor: '#333333' }, mr: 2 }}
                    >
                      {t('save')}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outlined"
                      sx={{ color: 'black', '&:hover': { backgroundColor: '#f2f2f2' } }}
                    >
                      {t('cancel')}
                    </Button>
                  </Box>
                </>
              )}
  {/* User Information Card */}
  <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>{t('postedBy')}</Typography>
              <Grid container spacing={2}>
                <Grid item>
                  <Avatar alt={post.User.Username} src={post.User.avatar} />
                </Grid>
                <Grid item xs>
                  <Typography variant="body1"><strong>{t('username')}:</strong> {post.User.Username}</Typography>
                  <Typography variant="body1"><strong>{t('name')}:</strong> {post.User.FirstName} {post.User.LastName}</Typography>
                  <Typography variant="body1"><strong>{t('email')}:</strong> {post.User.Email}</Typography>
                  <Typography variant="body1"><strong>{t('phoneNumber')}:</strong> {post.User.PhoneNumber}</Typography>
                  <Typography variant="body1"><strong>{t('location')}:</strong> {post.User.Location}</Typography>
                  <Typography variant="body1"><strong>{t('memberSince')}:</strong> {post.User.Date_formatted}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        {user && post.User && (user.isAdmin || String(post.User._id) === String(user._id)) && !isEditing && (
          
  <CardActions>
    
    <Button
      onClick={() => setIsEditing(true) || setEditPostData(post)}
      variant="contained"
      color="primary"
      startIcon={<EditIcon />}
      sx={{ mr: 2 }}
    >
      {t('editPost')}
    </Button>
    <Button
      onClick={handleDeletePost}
      variant="contained"
      color="error"
      startIcon={<DeleteIcon />}
    >
      {t('deletePost')}
    </Button>
  </CardActions>
)}


              <Typography variant="h6" sx={{ mt: 2 }}>{t('favoriteBy')} {post.favoritesCount} {t('users')}</Typography>
              <CardActions>
                <Button
                  onClick={handleToggleFavorite}
                  variant="contained"
                  sx={{
                    backgroundColor: '#000000',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: isFavorited ? '#7a1f1f' : '#333333',
                    },
                  }}
                  startIcon={isFavorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                >
                  {isFavorited ? t('removeFavorite') : t('addFavorite')}
                </Button>
                {favoriteError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {favoriteError}
                  </Alert>
                )}
              </CardActions>
            </CardContent>
          </Card>
        </Grid>

        {/* Comments Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>{t('comments')}</Typography>
              <Grid container spacing={2}>
                {comments.map((comment) => (
                  <Grid item xs={12} key={comment._id}>
                    <Card>
                      <CardContent>
                        <Grid container alignItems="center" spacing={2}>
                          <Grid item>
                            <Avatar alt={comment.User?.Username} src={comment.User?.avatar} />
                          </Grid>
                          <Grid item xs>
                            <Typography variant="body1">
                              {comment.Comment}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {comment.edited ? `${t('editedBy')} ${comment.User?._id === user._id ? 'YOU' : comment.User?.Username}` : `${t('postedBy')} ${comment.User?._id === user._id ? 'YOU' : comment.User?.Username}`}
                            </Typography>
                          </Grid>
                          {user && (user.isAdmin || comment.User?._id === user._id) && (
                            <>
                              <Grid item>
                                <IconButton onClick={() => { setEditCommentId(comment._id); setEditCommentText(comment.Comment); }}>
                                  <EditIcon />
                                </IconButton>
                              </Grid>
                              <Grid item>
                                <IconButton onClick={() => handleDeleteComment(comment._id)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Grid>
                            </>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {user ? (
                <Box mt={2}>
                  {editCommentId ? (
                    <Grid container spacing={2}>
                      <Grid item xs>
                        <TextField
                          label={t('editComment')}
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          variant="outlined"
                          size="small"
                          fullWidth
                        />
                      </Grid>
                      <Grid item>
                        <Button onClick={() => handleEditComment(editCommentId)} variant="contained" sx={{ backgroundColor: '#000000', color: 'white', '&:hover': { backgroundColor: '#333333' } }}>
                          {t('save')}
                        </Button>
                      </Grid>
                    </Grid>
                  ) : (
                    <Grid container spacing={2}>
                      <Grid item xs>
                        <TextField
                          label={t('addComment')}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          variant="outlined"
                          size="small"
                          fullWidth
                        />
                      </Grid>
                      <Grid item>
                        <Button onClick={handleAddComment} variant="contained" sx={{ backgroundColor: '#000000', color: 'white', '&:hover': { backgroundColor: '#333333' } }}>
                          {t('submit')}
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </Box>
              ) : (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {t('loginPrompt')}
                </Alert>
              )}
              {commentError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {commentError}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>{t('relatedPosts')}</Typography>
                <Grid container spacing={2}>
                  {relatedPosts.map((relatedPost, index) => (
                    <Grid item xs={12} sm={6} md={4} key={relatedPost._id}>
                      <Card onClick={() => handleRelatedPostClick(relatedPost._id)} sx={{ cursor: 'pointer' }}>
                        <Box position="relative" display="flex" alignItems="center" justifyContent="center">
                          <img
                            src={relatedPost.imgs && relatedPost.imgs.length > 0 ? relatedPost.imgs[0] : relatedPost.Cover}
                            alt={`${relatedPost.Title} cover`}
                            style={{ width: '80%', height: 'auto', borderRadius: '8px', margin: '0 auto' }}
                          />
                        </Box>
                        <CardContent>
                          <Typography variant="h6">{relatedPost.Title}</Typography>
                          <Typography variant="body2">{relatedPost.Description}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default PostDetail;
