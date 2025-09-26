from django import forms
from .models import CommunityReport, ReportComment

class CommunityReportForm(forms.ModelForm):
    class Meta:
        model = CommunityReport
        fields = [
            'report_type', 'title', 'description', 'location', 'city',
            'latitude', 'longitude', 'severity', 'image', 'is_anonymous'
        ]
        widgets = {
            'report_type': forms.Select(attrs={'class': 'form-control'}),
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Brief title describing the issue'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 5,
                'placeholder': 'Detailed description of the issue...'
            }),
            'location': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Specific location/address'
            }),
            'city': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'City name'
            }),
            'latitude': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': 'any',
                'placeholder': 'Latitude (optional)'
            }),
            'longitude': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': 'any',
                'placeholder': 'Longitude (optional)'
            }),
            'severity': forms.Select(attrs={'class': 'form-control'}),
            'image': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*'
            }),
            'is_anonymous': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['title'].help_text = 'Provide a clear, concise title'
        self.fields['description'].help_text = 'Describe the issue in detail including when you noticed it'
        self.fields['location'].help_text = 'Provide the exact location where the issue was observed'
        self.fields['image'].help_text = 'Upload a photo if available (optional)'
        self.fields['is_anonymous'].help_text = 'Check to submit this report anonymously'

class ReportCommentForm(forms.ModelForm):
    class Meta:
        model = ReportComment
        fields = ['content', 'is_anonymous']
        widgets = {
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Share your thoughts or additional information...'
            }),
            'is_anonymous': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['content'].label = 'Your Comment'
        self.fields['is_anonymous'].label = 'Comment anonymously'