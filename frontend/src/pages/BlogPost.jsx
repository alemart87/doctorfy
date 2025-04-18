import { useEffect,useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Divider, Skeleton, Button } from '@mui/material';
import axios from 'axios';

export default function BlogPost(){
  const { slug } = useParams();
  const [post,setPost] = useState(null);

  const getBanner = (b) => {
    if (!b) return process.env.PUBLIC_URL + '/images/blog/default.jpg';
    if (b.startsWith('http')) return b;
    return process.env.PUBLIC_URL + b;
  };

  useEffect(()=>{ axios.get(`/api/blog/${slug}`).then(r=>setPost(r.data)); },[slug]);

  if(!post) return <Container sx={{py:6}}><Skeleton height={500}/></Container>;

  return (
    <Container sx={{py:6}}>
      <Button component={Link} to="/blog" sx={{mb:3}}>← Volver</Button>
      <img
        src={getBanner(post.banner)}
        alt={post.title}
        style={{width:'100%',maxHeight:400,objectFit:'cover'}}
      />
      <Typography variant="h2" sx={{my:2,fontWeight:700}}>{post.title}</Typography>
      <Typography variant="subtitle1" sx={{mb:4}} color="text.secondary">{post.date}</Typography>
      <Divider sx={{mb:3}}/>
      <div dangerouslySetInnerHTML={{__html:post.content}} />
    </Container>
  );
} 