// Quick test script for pattern detection
const { PatternDetector, generateMockMetadata } = require('./src/lib/pattern-detection.ts')

// Mock project data for testing
const mockProjects = [
  {
    id: '1',
    user_id: 'test-user',
    name: 'Weekend Todo App',
    death_date: '2024-01-08', // Monday
    death_cause: 'lost_interest',
    tech_stack: ['React', 'Node.js'],
    created_at: '2024-01-06' // Saturday
  },
  {
    id: '2', 
    user_id: 'test-user',
    name: 'Another Weekend Project',
    death_date: '2024-01-15', // Monday
    death_cause: 'lost_interest',
    tech_stack: ['Vue.js', 'Express'],
    created_at: '2024-01-13' // Saturday
  },
  {
    id: '3',
    user_id: 'test-user', 
    name: 'Auth-First App',
    death_date: '2024-02-05',
    death_cause: 'over_scoped',
    tech_stack: ['React', 'Firebase', 'Auth0'],
    created_at: '2024-02-01'
  }
]

// Generate mock metadata
const mockMetadata = mockProjects.map(generateMockMetadata)

// Add some specific metadata to trigger patterns
mockMetadata[2].first_commit_type = 'auth'
mockMetadata[2].total_days_active = 4
mockMetadata[2].libraries_count = 8

console.log('Testing Pattern Detection...')
console.log('Projects:', mockProjects.length)
console.log('Mock metadata generated')

// Test weekend warrior pattern
const weekendProjects = mockProjects.filter(p => {
  const startDay = new Date(p.created_at).getDay()
  const deathDate = new Date(p.death_date)
  const createDate = new Date(p.created_at)
  const daysAlive = (deathDate.getTime() - createDate.getTime()) / (1000 * 60 * 60 * 24)
  
  return (startDay === 5 || startDay === 6 || startDay === 0) && daysAlive <= 3
})

console.log('Weekend warrior candidates:', weekendProjects.length)

// Test auth curse pattern  
const authProjects = mockProjects.filter(p => {
  const meta = mockMetadata.find(m => m.project_id === p.id)
  return meta?.first_commit_type === 'auth' && (meta?.total_days_active || 0) <= 7
})

console.log('Auth curse candidates:', authProjects.length)

console.log('✅ Pattern detection test completed - patterns should be detected!')