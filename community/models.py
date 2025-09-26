from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class CommunityReport(models.Model):
    REPORT_TYPES = [
        ('waterlogging', 'Waterlogging'),
        ('air_pollution', 'Air Pollution'),
        ('water_pollution', 'Water Pollution'),
        ('waste_management', 'Waste Management'),
        ('drainage_issue', 'Drainage Issue'),
        ('flooding', 'Flooding'),
        ('other', 'Other'),
    ]
    
    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    report_type = models.CharField(max_length=50, choices=REPORT_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    image = models.ImageField(upload_to='community_reports/', blank=True, null=True)
    is_anonymous = models.BooleanField(default=False)
    upvotes = models.IntegerField(default=0)
    downvotes = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.city}"
    
    @property
    def vote_score(self):
        return self.upvotes - self.downvotes
    
    @property
    def reporter_name(self):
        if self.is_anonymous:
            return "Anonymous"
        return f"{self.user.first_name} {self.user.last_name}" if self.user.first_name else self.user.username

class ReportVote(models.Model):
    VOTE_CHOICES = [
        ('up', 'Upvote'),
        ('down', 'Downvote'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    report = models.ForeignKey(CommunityReport, on_delete=models.CASCADE)
    vote_type = models.CharField(max_length=10, choices=VOTE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'report')
    
    def save(self, *args, **kwargs):
        # Update vote counts when saving
        if self.pk:  # Update existing vote
            old_vote = ReportVote.objects.get(pk=self.pk)
            if old_vote.vote_type != self.vote_type:
                if old_vote.vote_type == 'up':
                    self.report.upvotes -= 1
                else:
                    self.report.downvotes -= 1
                
                if self.vote_type == 'up':
                    self.report.upvotes += 1
                else:
                    self.report.downvotes += 1
        else:  # New vote
            if self.vote_type == 'up':
                self.report.upvotes += 1
            else:
                self.report.downvotes += 1
        
        self.report.save()
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        # Update vote counts when deleting
        if self.vote_type == 'up':
            self.report.upvotes -= 1
        else:
            self.report.downvotes -= 1
        self.report.save()
        super().delete(*args, **kwargs)

class ReportComment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    report = models.ForeignKey(CommunityReport, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    is_anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment on {self.report.title} by {self.user.username}"
    
    @property
    def author_name(self):
        if self.is_anonymous:
            return "Anonymous"
        return f"{self.user.first_name} {self.user.last_name}" if self.user.first_name else self.user.username

class CommunityChallenge(models.Model):
    CHALLENGE_TYPES = [
        ('tree_planting', 'Tree Planting'),
        ('waste_reduction', 'Waste Reduction'),
        ('water_conservation', 'Water Conservation'),
        ('air_quality_improvement', 'Air Quality Improvement'),
        ('community_cleanup', 'Community Cleanup'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    challenge_type = models.CharField(max_length=50, choices=CHALLENGE_TYPES)
    target_participants = models.IntegerField(default=100)
    current_participants = models.IntegerField(default=0)
    start_date = models.DateField()
    end_date = models.DateField()
    reward_points = models.IntegerField(default=10)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_challenges')
    participants = models.ManyToManyField(User, through='ChallengeParticipation', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    
    @property
    def participation_percentage(self):
        return min(100, (self.current_participants / self.target_participants) * 100)

class ChallengeParticipation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    challenge = models.ForeignKey(CommunityChallenge, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    completion_proof = models.TextField(blank=True, null=True)
    points_earned = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ('user', 'challenge')
    
    def __str__(self):
        return f"{self.user.username} - {self.challenge.title}"
