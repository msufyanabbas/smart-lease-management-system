import { Card, CardContent, Typography, Button } from '@mui/material';

const QuickActionCard = ({ title, value, valueColor, description, buttonLabel }) => (
  <Card sx={{ backgroundColor: '#f5f5f5' }}>
    <CardContent>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="h4" color={valueColor}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
      <Button variant="outlined" size="small" sx={{ mt: 1 }}>
        {buttonLabel}
      </Button>
    </CardContent>
  </Card>
);

export default QuickActionCard;
