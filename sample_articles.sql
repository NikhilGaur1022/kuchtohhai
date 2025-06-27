-- Insert sample articles
INSERT INTO articles (title, excerpt, content, author, category, image_url, is_approved, user_id)
VALUES
  (
    'Latest Advances in Dental Implant Technology',
    'Explore the cutting-edge developments in dental implant procedures and materials that are revolutionizing patient care.',
    'Dental implant technology has seen remarkable advances in recent years. This article explores the latest developments in implant materials, digital planning software, and surgical techniques. We'll discuss how these innovations are improving patient outcomes and reducing recovery times.',
    'Dr. Sarah Johnson',
    'Clinical Dentistry',
    'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=1000&auto=format&fit=crop',
    true,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    'Digital Dentistry: The Future of Practice Management',
    'How digital tools and software are transforming dental practice management and improving patient care.',
    'The digital revolution has finally reached dentistry. From electronic health records to 3D printing, digital tools are making dental practices more efficient and effective. This article examines the key technologies that every modern dental practice should consider implementing.',
    'Dr. Michael Chen',
    'Dental Technology',
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1000&auto=format&fit=crop',
    true,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    'Sustainable Dentistry: Eco-Friendly Practices',
    'Implementing environmentally conscious practices in your dental office without compromising on quality care.',
    'Environmental consciousness is becoming increasingly important in healthcare. This article provides practical tips for making your dental practice more sustainable, from reducing waste to choosing eco-friendly materials and equipment.',
    'Dr. Emily Green',
    'Practice Management',
    'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?q=80&w=1000&auto=format&fit=crop',
    true,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    'Innovation in Dental Education',
    'New approaches to dental education that are preparing the next generation of dental professionals.',
    'Dental education is evolving rapidly with new technologies and teaching methods. This article explores innovative approaches in dental schools, including virtual reality training, simulation-based learning, and integrated clinical experience.',
    'Prof. James Wilson',
    'Dental Education',
    'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=1000&auto=format&fit=crop',
    true,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    'Breakthrough Research in Periodontal Treatment',
    'New research findings that could revolutionize how we treat periodontal disease.',
    'Recent research has unveiled promising new approaches to treating periodontal disease. This article summarizes key findings from recent studies and discusses their potential impact on clinical practice.',
    'Dr. Lisa Martinez',
    'Dental Research',
    'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=1000&auto=format&fit=crop',
    true,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    'Community Outreach: Dental Health Education',
    'Effective strategies for promoting dental health awareness in local communities.',
    'Community dental health education is crucial for preventing oral health problems. This article shares successful strategies for engaging communities and promoting better oral health practices.',
    'Dr. Robert Taylor',
    'Community Dentistry',
    'https://images.unsplash.com/photo-1629909615184-74f495363b67?q=80&w=1000&auto=format&fit=crop',
    true,
    (SELECT id FROM auth.users LIMIT 1)
  ); 