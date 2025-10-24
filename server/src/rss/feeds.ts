export interface FeedConfig {
  key: string;
  name: string;
  url: string;
}

export const feeds: FeedConfig[] = [
  { key: 'openai', name: 'OpenAI', url: 'https://openai.com/news/rss.xml' },
  { key: 'google-ai', name: 'Google AI Blog', url: 'https://ai.googleblog.com/atom.xml' },
  { key: 'deepmind', name: 'DeepMind', url: 'https://deepmind.com/feeds/blog.rss' },
  { key: 'meta-ai', name: 'Meta AI', url: 'https://ai.meta.com/blog/rss/' },
  { key: 'anthropic', name: 'Anthropic', url: 'https://www.anthropic.com/news/rss.xml' },
  { key: 'huggingface', name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml' },
  { key: 'nvidia', name: 'NVIDIA Technical Blog', url: 'https://developer.nvidia.com/blog/feed' },
  { key: 'aws-news', name: 'AWS News', url: 'https://aws.amazon.com/blogs/aws/feed/' },
  { key: 'aws-architecture', name: 'AWS Architecture', url: 'https://aws.amazon.com/blogs/architecture/feed/' },
  { key: 'aws-compute', name: 'AWS Compute', url: 'https://aws.amazon.com/blogs/compute/feed/' },
  { key: 'aws-ml', name: 'AWS Machine Learning', url: 'https://aws.amazon.com/blogs/machine-learning/feed/' },
  { key: 'github', name: 'GitHub Blog', url: 'https://github.blog/feed/' },
  { key: 'hashicorp', name: 'HashiCorp', url: 'https://www.hashicorp.com/blog/index.xml' },
  { key: 'kubernetes', name: 'Kubernetes', url: 'https://kubernetes.io/feed.xml' },
  { key: 'docker', name: 'Docker', url: 'https://www.docker.com/blog/feed/' },
  { key: 'google-cloud', name: 'Google Cloud', url: 'https://cloud.google.com/blog/rss/' },
  { key: 'nodejs', name: 'Node.js', url: 'https://nodejs.org/en/feed/blog.xml' },
  { key: 'v8', name: 'V8', url: 'https://v8.dev/blog.atom' },
  { key: 'typescript', name: 'TypeScript', url: 'https://devblogs.microsoft.com/typescript/feed/' },
  { key: 'react', name: 'React', url: 'https://react.dev/feed.xml' }
];

export const feedMap = new Map(feeds.map((feed) => [feed.key, feed] as const));
