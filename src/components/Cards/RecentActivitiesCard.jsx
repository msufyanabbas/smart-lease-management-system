import { Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';

const activities = [
  'Site A created',
  'Contract B approved',
  'Request C submitted',
];

export default function RecentActivities() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Activities
        </Typography>
        <List>
          {activities.map((activity, idx) => (
            <ListItem key={idx}>
              <ListItemText primary={activity} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}