import gitlab
import os
from typing import List, Dict, Optional
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GITLAB_TOKEN = os.getenv('GITLAB_TOKEN')
GITLAB_PROJECT_ID = os.getenv('GITLAB_PROJECT_ID')
GITLAB_URL = os.getenv('GITLAB_URL')

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GitLabPRManager:
    def __init__(self, gitlab_url: str, private_token: str):
        """
        Initialize GitLab PR Manager
        
        Args:
            gitlab_url (str): GitLab instance URL (e.g., 'https://gitlab.com')
            private_token (str): GitLab personal access token
        """
        self.gl = gitlab.Gitlab(gitlab_url, private_token=private_token)
        # Test authentication
        try:
            self.gl.auth()
            logger.info("Successfully authenticated with GitLab")
        except gitlab.exceptions.GitlabAuthenticationError:
            logger.error("Authentication failed. Please check your GitLab token.")
            raise
        
    def get_merge_requests(self, project_id: str, state: str = 'opened') -> List[Dict]:
        """
        Retrieve merge requests from a GitLab project
        
        Args:
            project_id (str): Project ID or path
            state (str): State of merge requests to retrieve ('opened', 'closed', 'merged')
            
        Returns:
            List[Dict]: List of merge requests with their details
        """
        try:
            logger.info(f"Attempting to fetch project with ID: {project_id}")
            # Try to get project by ID first
            try:
                project = self.gl.projects.get(project_id)
            except gitlab.exceptions.GitlabGetError:
                logger.info(f"Failed to get project by ID, trying to get by path: {project_id}")
                # If ID fails, try to get by path
                project = self.gl.projects.get(project_id.replace('/', '%2F'))
            
            logger.info(f"Successfully retrieved project: {project.name}")
            
            logger.info(f"Fetching merge requests with state: {state}")
            merge_requests = project.mergerequests.list(state=state)
            
            mr_list = []
            for mr in merge_requests:
                mr_info = {
                    'id': mr.iid,
                    'title': mr.title,
                    'description': mr.description,
                    'state': mr.state,
                    'created_at': mr.created_at,
                    'updated_at': mr.updated_at,
                    'author': {
                        'name': mr.author['name'],
                        'username': mr.author['username']
                    },
                    'source_branch': mr.source_branch,
                    'target_branch': mr.target_branch,
                    'web_url': mr.web_url
                }
                mr_list.append(mr_info)
            
            logger.info(f"Successfully retrieved {len(mr_list)} merge requests")
            return mr_list
            
        except gitlab.exceptions.GitlabAuthenticationError:
            logger.error("Authentication failed. Please check your GitLab token.")
            raise Exception("Authentication failed. Please check your GitLab token.")
        except gitlab.exceptions.GitlabGetError as e:
            logger.error(f"Failed to retrieve merge requests: {str(e)}")
            raise Exception(f"Failed to retrieve merge requests for project {project_id}. Error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error occurred: {str(e)}")
            raise Exception(f"An unexpected error occurred: {str(e)}")



# def main():
#     # Example usage
#     gitlab_url = os.getenv('GITLAB_URL', 'https://gitlab.com')
#     private_token = os.getenv('GITLAB_TOKEN')
#     project_id = os.getenv('GITLAB_PROJECT_ID')
    
#     if not all([private_token, project_id]):
#         print("Please set GITLAB_TOKEN and GITLAB_PROJECT_ID environment variables")
#         return
    
#     try:
#         pr_manager = GitLabPRManager(gitlab_url, private_token)
#         merge_requests = pr_manager.get_merge_requests(project_id)
        
#         print(f"\nFound {len(merge_requests)} merge requests:")
#         for mr in merge_requests:
#             print(f"\nTitle: {mr['title']}")
#             print(f"ID: {mr['id']}")
#             print(f"State: {mr['state']}")
#             print(f"Author: {mr['author']['name']}")
#             print(f"Source Branch: {mr['source_branch']}")
#             print(f"Target Branch: {mr['target_branch']}")
#             print(f"URL: {mr['web_url']}")
#             print("-" * 50)
            
#     except Exception as e:
#         print(f"Error: {str(e)}")

# if __name__ == "__main__":
#     main()