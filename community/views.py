# from django.shortcuts import render, get_object_or_404, redirect
# from django.contrib.auth.decorators import login_required
# from django.contrib import messages
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.core.paginator import Paginator
# from django.db.models import Q
# import json

# from .models import CommunityReport, ReportVote, ReportComment, CommunityChallenge, ChallengeParticipation
# from .forms import CommunityReportForm, ReportCommentForm

# @login_required
# def community_reports(request):
#     """Community reports listing page"""
#     # Get filter parameters
#     report_type = request.GET.get('type', 'all')
#     city = request.GET.get('city', request.user.city or '')
#     severity = request.GET.get('severity', 'all')
#     status = request.GET.get('status', 'all')
#     search = request.GET.get('search', '')
    
#     # Base queryset
#     reports = CommunityReport.objects.all()
    
#     # Apply filters
#     if report_type != 'all':
#         reports = reports.filter(report_type=report_type)
    
#     if city:
#         reports = reports.filter(city__icontains=city)
    
#     if severity != 'all':
#         reports = reports.filter(severity=severity)
    
#     if status != 'all':
#         reports = reports.filter(status=status)
    
#     if search:
#         reports = reports.filter(
#             Q(title__icontains=search) | 
#             Q(description__icontains=search) |
#             Q(location__icontains=search)
#         )
    
#     # Order by vote score and creation date
#     reports = reports.order_by('-upvotes', '-created_at')
    
#     # Pagination
#     paginator = Paginator(reports, 10)
#     page_number = request.GET.get('page')
#     page_obj = paginator.get_page(page_number)
    
#     # Get unique cities for filter dropdown
#     cities = CommunityReport.objects.values_list('city', flat=True).distinct()
    
#     context = {
#         'page_obj': page_obj,
#         'report_types': CommunityReport.REPORT_TYPES,
#         'severity_levels': CommunityReport.SEVERITY_LEVELS,
#         'status_choices': CommunityReport.STATUS_CHOICES,
#         'cities': cities,
#         'current_filters': {
#             'type': report_type,
#             'city': city,
#             'severity': severity,
#             'status': status,
#             'search': search,
#         }
#     }
    
#     return render(request, 'community/reports.html', context)

# @login_required
# def report_detail(request, report_id):
#     """Community report detail page"""
#     report = get_object_or_404(CommunityReport, id=report_id)
#     comments = report.comments.all()
#     user_vote = None
    
#     # Check if user has voted
#     try:
#         user_vote = ReportVote.objects.get(user=request.user, report=report)
#     except ReportVote.DoesNotExist:
#         pass
    
#     # Handle comment form
#     if request.method == 'POST' and 'add_comment' in request.POST:
#         comment_form = ReportCommentForm(request.POST)
#         if comment_form.is_valid():
#             comment = comment_form.save(commit=False)
#             comment.user = request.user
#             comment.report = report
#             comment.save()
#             messages.success(request, 'Comment added successfully!')
#             return redirect('report_detail', report_id=report.id)
#     else:
#         comment_form = ReportCommentForm()
    
#     context = {
#         'report': report,
#         'comments': comments,
#         'user_vote': user_vote,
#         'comment_form': comment_form,
#     }
    
#     return render(request, 'community/report_detail.html', context)

# @login_required
# def create_report(request):
#     """Create new community report"""
#     if request.method == 'POST':
#         form = CommunityReportForm(request.POST, request.FILES)
#         if form.is_valid():
#             report = form.save(commit=False)
#             report.user = request.user
#             report.city = report.city or request.user.city or 'Unknown'
#             report.save()
#             messages.success(request, 'Report submitted successfully!')
#             return redirect('community_reports')
#     else:
#         # Pre-fill city with user's city
#         initial_data = {'city': request.user.city} if request.user.city else {}
#         form = CommunityReportForm(initial=initial_data)
    
#     return render(request, 'community/create_report.html', {'form': form})

# @login_required
# @csrf_exempt
# def vote_report(request, report_id):
#     """Handle voting on reports"""
#     if request.method == 'POST':
#         report = get_object_or_404(CommunityReport, id=report_id)
#         data = json.loads(request.body)
#         vote_type = data.get('vote_type')
        
#         if vote_type not in ['up', 'down']:
#             return JsonResponse({'success': False, 'error': 'Invalid vote type'})
        
#         try:
#             # Check if user already voted
#             existing_vote = ReportVote.objects.get(user=request.user, report=report)
#             if existing_vote.vote_type == vote_type:
#                 # Remove vote if clicking same button
#                 existing_vote.delete()
#                 action = 'removed'
#             else:
#                 # Change vote
#                 existing_vote.vote_type = vote_type
#                 existing_vote.save()
#                 action = 'changed'
#         except ReportVote.DoesNotExist:
#             # Create new vote
#             ReportVote.objects.create(user=request.user, report=report, vote_type=vote_type)
#             action = 'created'
        
#         # Refresh report data
#         report.refresh_from_db()
        
#         return JsonResponse({
#             'success': True,
#             'action': action,
#             'upvotes': report.upvotes,
#             'downvotes': report.downvotes,
#             'vote_score': report.vote_score
#         })
    
#     return JsonResponse({'success': False, 'error': 'Invalid request method'})

# @login_required
# def challenges(request):
#     """Community challenges page"""
#     active_challenges = CommunityChallenge.objects.filter(is_active=True).order_by('-created_at')
#     user_participations = ChallengeParticipation.objects.filter(user=request.user)
#     user_challenge_ids = user_participations.values_list('challenge_id', flat=True)
    
#     context = {
#         'challenges': active_challenges,
#         'user_challenge_ids': list(user_challenge_ids),
#         'user_participations': user_participations,
#     }
    
#     return render(request, 'community/challenges.html', context)

# @login_required
# @csrf_exempt
# def join_challenge(request, challenge_id):
#     """Join a community challenge"""
#     if request.method == 'POST':
#         challenge = get_object_or_404(CommunityChallenge, id=challenge_id)
        
#         # Check if user already joined
#         if ChallengeParticipation.objects.filter(user=request.user, challenge=challenge).exists():
#             return JsonResponse({'success': False, 'error': 'Already joined this challenge'})
        
#         # Create participation
#         participation = ChallengeParticipation.objects.create(
#             user=request.user,
#             challenge=challenge
#         )
        
#         # Update participant count
#         challenge.current_participants += 1
#         challenge.save()
        
#         return JsonResponse({
#             'success': True,
#             'message': 'Successfully joined the challenge!',
#             'current_participants': challenge.current_participants
#         })
    
#     return JsonResponse({'success': False, 'error': 'Invalid request method'})

# @login_required
# def my_reports(request):
#     """User's own reports"""
#     reports = CommunityReport.objects.filter(user=request.user).order_by('-created_at')
    
#     # Pagination
#     paginator = Paginator(reports, 10)
#     page_number = request.GET.get('page')
#     page_obj = paginator.get_page(page_number)
    
#     context = {
#         'page_obj': page_obj,
#     }


from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django.db.models import Q
import json

from .models import CommunityReport, ReportVote, ReportComment, CommunityChallenge, ChallengeParticipation
from .forms import CommunityReportForm,ReportCommentForm

@login_required
def community_reports(request):
    """Community reports listing page"""
    # Get filter parameters
    report_type = request.GET.get('type', 'all')
    city = request.GET.get('city', request.user.city or '')
    severity = request.GET.get('severity', 'all')
    status = request.GET.get('status', 'all')
    search = request.GET.get('search', '')
    
    # Base queryset
    reports = CommunityReport.objects.all()
    
    # Apply filters
    if report_type != 'all':
        reports = reports.filter(report_type=report_type)
    
    if city:
        reports = reports.filter(city__icontains=city)
    
    if severity != 'all':
        reports = reports.filter(severity=severity)
    
    if status != 'all':
        reports = reports.filter(status=status)
    
    if search:
        reports = reports.filter(
            Q(title__icontains=search) | 
            Q(description__icontains=search) |
            Q(location__icontains=search)
        )
    
    # Order by vote score and creation date
    reports = reports.order_by('-upvotes', '-created_at')
    
    # Pagination
    paginator = Paginator(reports, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # Get unique cities for filter dropdown
    cities = CommunityReport.objects.values_list('city', flat=True).distinct()
    
    context = {
        'page_obj': page_obj,
        'report_types': CommunityReport.REPORT_TYPES,
        'severity_levels': CommunityReport.SEVERITY_LEVELS,
        'status_choices': CommunityReport.STATUS_CHOICES,
        'cities': cities,
        'current_filters': {
            'type': report_type,
            'city': city,
            'severity': severity,
            'status': status,
            'search': search,
        }
    }
    
    return render(request, 'community/reports.html', context)

@login_required
def report_detail(request, report_id):
    """Community report detail page"""
    report = get_object_or_404(CommunityReport, id=report_id)
    comments = report.comments.all()
    user_vote = None
    
    # Check if user has voted
    try:
        user_vote = ReportVote.objects.get(user=request.user, report=report)
    except ReportVote.DoesNotExist:
        pass
    
    # Handle comment form
    if request.method == 'POST' and 'add_comment' in request.POST:
        comment_form = ReportCommentForm(request.POST)
        if comment_form.is_valid():
            comment = comment_form.save(commit=False)
            comment.user = request.user
            comment.report = report
            comment.save()
            messages.success(request, 'Comment added successfully!')
            return redirect('report_detail', report_id=report.id)
    else:
        comment_form = ReportCommentForm()
    
    context = {
        'report': report,
        'comments': comments,
        'user_vote': user_vote,
        'comment_form': comment_form,
    }
    
    return render(request, 'community/report_detail.html', context)

@login_required
def create_report(request):
    """Create new community report"""
    if request.method == 'POST':
        form = CommunityReportForm(request.POST, request.FILES)
        if form.is_valid():
            report = form.save(commit=False)
            report.user = request.user
            report.city = report.city or request.user.city or 'Unknown'
            report.save()
            messages.success(request, 'Report submitted successfully!')
            return redirect('community_reports')
    else:
        # Pre-fill city with user's city
        initial_data = {'city': request.user.city} if request.user.city else {}
        form = CommunityReportForm(initial=initial_data)
    
    return render(request, 'community/create_report.html', {'form': form})

@login_required
@csrf_exempt
def vote_report(request, report_id):
    """Handle voting on reports"""
    if request.method == 'POST':
        report = get_object_or_404(CommunityReport, id=report_id)
        data = json.loads(request.body)
        vote_type = data.get('vote_type')
        
        if vote_type not in ['up', 'down']:
            return JsonResponse({'success': False, 'error': 'Invalid vote type'})
        
        try:
            # Check if user already voted
            existing_vote = ReportVote.objects.get(user=request.user, report=report)
            if existing_vote.vote_type == vote_type:
                # Remove vote if clicking same button
                existing_vote.delete()
                action = 'removed'
            else:
                # Change vote
                existing_vote.vote_type = vote_type
                existing_vote.save()
                action = 'changed'
        except ReportVote.DoesNotExist:
            # Create new vote
            ReportVote.objects.create(user=request.user, report=report, vote_type=vote_type)
            action = 'created'
        
        # Refresh report data
        report.refresh_from_db()
        
        return JsonResponse({
            'success': True,
            'action': action,
            'upvotes': report.upvotes,
            'downvotes': report.downvotes,
            'vote_score': report.vote_score
        })
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'})

@login_required
def challenges(request):
    """Community challenges page"""
    active_challenges = CommunityChallenge.objects.filter(is_active=True).order_by('-created_at')
    user_participations = ChallengeParticipation.objects.filter(user=request.user)
    user_challenge_ids = user_participations.values_list('challenge_id', flat=True)
    
    context = {
        'challenges': active_challenges,
        'user_challenge_ids': list(user_challenge_ids),
        'user_participations': user_participations,
    }
    
    return render(request, 'community/challenges.html', context)

@login_required
@csrf_exempt
def join_challenge(request, challenge_id):
    """Join a community challenge"""
    if request.method == 'POST':
        challenge = get_object_or_404(CommunityChallenge, id=challenge_id)
        
        # Check if user already joined
        if ChallengeParticipation.objects.filter(user=request.user, challenge=challenge).exists():
            return JsonResponse({'success': False, 'error': 'Already joined this challenge'})
        
        # Create participation
        participation = ChallengeParticipation.objects.create(
            user=request.user,
            challenge=challenge
        )
        
        # Update participant count
        challenge.current_participants += 1
        challenge.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Successfully joined the challenge!',
            'current_participants': challenge.current_participants
        })
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'})

@login_required
def my_reports(request):
    """User's own reports"""
    reports = CommunityReport.objects.filter(user=request.user).order_by('-created_at')
    
    # Pagination
    paginator = Paginator(reports, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
    }
    
    return render(request, 'community/my_reports.html', context)

@login_required
def analytics(request):
    """Community analytics dashboard"""
    user_city = request.user.city or 'Chennai'
    
    # Get analytics data
    total_reports = CommunityReport.objects.filter(city__icontains=user_city).count()
    pending_reports = CommunityReport.objects.filter(city__icontains=user_city, status='pending').count()
    resolved_reports = CommunityReport.objects.filter(city__icontains=user_city, status='resolved').count()
    
    # Report types distribution
    report_types_data = []
    for report_type, label in CommunityReport.REPORT_TYPES:
        count = CommunityReport.objects.filter(
            city__icontains=user_city, 
            report_type=report_type
        ).count()
        if count > 0:
            report_types_data.append({
                'type': label,
                'count': count,
                'percentage': (count / total_reports) * 100 if total_reports > 0 else 0
            })
    
    # Severity distribution
    severity_data = []
    for severity, label in CommunityReport.SEVERITY_LEVELS:
        count = CommunityReport.objects.filter(
            city__icontains=user_city,
            severity=severity
        ).count()
        if count > 0:
            severity_data.append({
                'severity': label,
                'count': count,
                'percentage': (count / total_reports) * 100 if total_reports > 0 else 0
            })
    
    # Recent activity
    recent_reports = CommunityReport.objects.filter(
        city__icontains=user_city
    ).order_by('-created_at')[:10]
    
    context = {
        'user_city': user_city,
        'total_reports': total_reports,
        'pending_reports': pending_reports,
        'resolved_reports': resolved_reports,
        'resolution_rate': (resolved_reports / total_reports) * 100 if total_reports > 0 else 0,
        'report_types_data': report_types_data,
        'severity_data': severity_data,
        'recent_reports': recent_reports,
    }
    
    return render(request, 'community/analytics.html', context)