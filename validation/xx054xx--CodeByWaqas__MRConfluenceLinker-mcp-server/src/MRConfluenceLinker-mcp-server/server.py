import os
import sys
import traceback
import logging
from typing import Dict, List, Optional
from dotenv import load_dotenv
from resources.client import GitLabPRManager
from mcp.server.fastmcp import FastMCP
from atlassian import Confluence

# Set up logging with more detailed format
logging.basicConfig(
    level=logging.DEBUG,  # Changed to DEBUG for more detailed logs
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stderr),
        logging.FileHandler('mcp_server.log')
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class PRAnalyzer:
    def __init__(self):
        try:
            logger.info("Initializing PRAnalyzer...")
            
            # Validate required environment variables
            required_vars = ['GITLAB_TOKEN', 'GITLAB_PROJECT_ID']
            missing_vars = [var for var in required_vars if not os.getenv(var)]
            if missing_vars:
                raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
            
            self.gitlab_url = os.getenv('GITLAB_URL', 'https://gitlab.com')
            self.gitlab_token = os.getenv('GITLAB_TOKEN')
            self.confluence_url = os.getenv('CONFLUENCE_URL')
            self.confluence_username = os.getenv('CONFLUENCE_USERNAME')
            self.confluence_token = os.getenv('CONFLUENCE_TOKEN')
            self.confluence_space = os.getenv('CONFLUENCE_SPACE')
            
            # Initialize MCP Server
            logger.info("Initializing MCP Server...")
            self.mcp = FastMCP("gitlab_pr_analysis")
            print("MCP Server initialized", file=sys.stderr)

            # Initialize GitLab client
            logger.info("Initializing GitLab client...")
            self.gitlab_manager = GitLabPRManager(self.gitlab_url, self.gitlab_token)
            
            # Initialize Confluence client if credentials are provided
            if all([self.confluence_url, self.confluence_username, self.confluence_token]):
                logger.info("Initializing Confluence client...")
                self.confluence = Confluence(
                    url=self.confluence_url,
                    username=self.confluence_username,
                    password=self.confluence_token
                )
            else:
                logger.warning("Confluence credentials not provided. Confluence integration will be disabled.")
                self.confluence = None
            
            # Register tools
            logger.info("Registering MCP tools...")
            self._register_tools()
            logger.info("PRAnalyzer initialization completed successfully")
            
        except Exception as e:
            logger.error(f"Error during initialization: {str(e)}")
            logger.error(traceback.format_exc())
            raise

    def _register_tools(self):
        """Register MCP tools for PR analysis."""
        @self.mcp.tool()
        async def fetch_mr_details(project_id: str, mr_id: Optional[int] = None) -> Dict:
            """Fetch details of a specific merge request or all merge requests"""
            logger.info(f"Fetching MR details for project: {project_id}, MR ID: {mr_id}")
            try:
                if mr_id:
                    # Fetch specific MR
                    project = self.gitlab_manager.gl.projects.get(project_id)
                    mr = project.mergerequests.get(mr_id)
                    logger.debug(f"Retrieved MR: {mr.title}")
                    return {
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
                        'web_url': mr.web_url,
                        'changes': mr.changes()['changes'] if mr.state == 'opened' else []
                    }
                else:
                    # Fetch all MRs
                    logger.debug("Fetching all MRs")
                    return self.gitlab_manager.get_merge_requests(project_id)
            except Exception as e:
                logger.error(f"Error fetching MR details: {str(e)}")
                logger.error(traceback.format_exc())
                raise

        @self.mcp.tool()
        async def analyze_code_changes(project_id: str, mr_id: int) -> Dict:
            """Analyze code changes in a merge request"""
            logger.info(f"Analyzing code changes for MR {mr_id} in project {project_id}")
            try:
                mr_details = await fetch_mr_details(project_id, mr_id)
                changes = mr_details.get('changes', [])
                
                analysis = {
                    'total_files_changed': len(changes),
                    'file_types': {},
                    'total_additions': 0,
                    'total_deletions': 0,
                    'files': []
                }
                
                for change in changes:
                    file_path = change['new_path']
                    file_type = file_path.split('.')[-1] if '.' in file_path else 'unknown'
                    
                    analysis['file_types'][file_type] = analysis['file_types'].get(file_type, 0) + 1
                    analysis['total_additions'] += change['diff'].count('+')
                    analysis['total_deletions'] += change['diff'].count('-')
                    
                    analysis['files'].append({
                        'path': file_path,
                        'type': file_type,
                        'additions': change['diff'].count('+'),
                        'deletions': change['diff'].count('-')
                    })
                
                logger.debug(f"Analysis completed: {analysis}")
                return analysis
            except Exception as e:
                logger.error(f"Error analyzing code changes: {str(e)}")
                logger.error(traceback.format_exc())
                raise

        @self.mcp.tool()
        async def store_in_confluence(project_id: str, mr_id: Optional[int] = None, analysis: Optional[Dict] = None) -> str:
            """Store analysis results in Confluence"""
            if not self.confluence:
                raise ValueError("Confluence integration is not configured")
            
            logger.info(f"Storing analysis in Confluence for project: {project_id}, MR ID: {mr_id}")
            try:
                # First verify Confluence access
                try:
                    # Test access to the space
                    self.confluence.get_space(self.confluence_space)
                    logger.info(f"Successfully verified access to Confluence space: {self.confluence_space}")
                except Exception as e:
                    logger.error(f"Failed to access Confluence space: {str(e)}")
                    raise ValueError(f"Failed to access Confluence space: {str(e)}")

                # If no MR ID provided, fetch all MRs
                if mr_id is None:
                    mr_details = await fetch_mr_details(project_id)
                    if isinstance(mr_details, list):
                        # Create a summary page for all MRs
                        content = "h2. Merge Requests Summary\n\n"
                        for mr in mr_details:
                            content += f"""
                            h3. {mr['title']}
                            * ID: {mr['id']}
                            * State: {mr['state']}
                            * Author: {mr['author']['name']}
                            * Source Branch: {mr['source_branch']}
                            * Target Branch: {mr['target_branch']}
                            * [View in GitLab]({mr['web_url']})
                            
                            """
                        
                        page_title = f"MR Summary - {project_id}"
                        try:
                            # Try to get or create the parent page
                            try:
                                parent_id = self.confluence.get_page_id(self.confluence_space, "PR Analysis Reports")
                            except Exception as e:
                                logger.warning(f"Parent page not found, creating it: {str(e)}")
                                parent_page = self.confluence.create_page(
                                    space=self.confluence_space,
                                    title="PR Analysis Reports",
                                    body="This page contains PR analysis reports."
                                )
                                parent_id = parent_page['id']
                            
                            page = self.confluence.create_page(
                                space=self.confluence_space,
                                title=page_title,
                                body=content,
                                parent_id=parent_id
                            )
                            
                            logger.info(f"Successfully created Confluence summary page: {page_title}")
                            return page['_links']['base'] + page['_links']['webui']
                        except Exception as e:
                            logger.error(f"Failed to create Confluence page: {str(e)}")
                            raise ValueError(f"Failed to create Confluence page: {str(e)}")
                    else:
                        raise ValueError("Unexpected response format from fetch_mr_details")
                
                # If MR ID is provided but no analysis, fetch MR details only
                if analysis is None:
                    mr_details = await fetch_mr_details(project_id, mr_id)
                    content = f"""
                    h2. Merge Request Details
                    
                    h3. Basic Information
                    * Title: {mr_details['title']}
                    * ID: {mr_details['id']}
                    * State: {mr_details['state']}
                    * Author: {mr_details['author']['name']}
                    * Source Branch: {mr_details['source_branch']}
                    * Target Branch: {mr_details['target_branch']}
                    * [View in GitLab]({mr_details['web_url']})
                    
                    h3. Changes
                    {{{{code}}}}
                    {mr_details.get('changes', [])}
                    {{{{code}}}}
                    """
                else:
                    # Full analysis with code changes
                    mr_details = await fetch_mr_details(project_id, mr_id)
                    content = f"""
                    h2. Merge Request Analysis Report
                    
                    h3. Basic Information
                    * Title: {mr_details['title']}
                    * ID: {mr_details['id']}
                    * State: {mr_details['state']}
                    * Author: {mr_details['author']['name']}
                    * Source Branch: {mr_details['source_branch']}
                    * Target Branch: {mr_details['target_branch']}
                    * [View in GitLab]({mr_details['web_url']})
                    
                    h3. Code Analysis
                    * Total Files Changed: {analysis.get('total_files_changed', 0)}
                    * Total Additions: {analysis.get('total_additions', 0)}
                    * Total Deletions: {analysis.get('total_deletions', 0)}
                    
                    h3. File Types Changed
                    {{{{code}}}}
                    {analysis.get('file_types', {})}
                    {{{{code}}}}
                    
                    h3. Detailed File Changes
                    ||File Path||Type||Additions||Deletions||
                    {chr(10).join(f"|{f['path']}|{f['type']}|{f['additions']}|{f['deletions']}|" for f in analysis.get('files', []))}
                    """
                
                # Create page in Confluence
                page_title = f"MR Analysis - {mr_details['title']}"
                try:
                    # Try to get or create the parent page
                    try:
                        parent_id = self.confluence.get_page_id(self.confluence_space, "PR Analysis Reports")
                    except Exception as e:
                        logger.warning(f"Parent page not found, creating it: {str(e)}")
                        parent_page = self.confluence.create_page(
                            space=self.confluence_space,
                            title="PR Analysis Reports",
                            body="This page contains PR analysis reports."
                        )
                        parent_id = parent_page['id']
                    
                    page = self.confluence.create_page(
                        space=self.confluence_space,
                        title=page_title,
                        body=content,
                        parent_id=parent_id
                    )
                    
                    logger.info(f"Successfully created Confluence page: {page_title}")
                    return page['_links']['base'] + page['_links']['webui']
                except Exception as e:
                    logger.error(f"Failed to create Confluence page: {str(e)}")
                    raise ValueError(f"Failed to create Confluence page: {str(e)}")
            except Exception as e:
                logger.error(f"Error storing analysis in Confluence: {str(e)}")
                logger.error(traceback.format_exc())
                raise

    def run(self):
        """Start the MCP server."""
        try:
            logger.info("Starting MCP Server for GitLab PR Analysis...")
            print("Running MCP Server for GitLab PR Analysis...", file=sys.stderr)
            self.mcp.run(transport="stdio")
        except Exception as e:
            logger.error(f"Fatal Error in MCP Server: {str(e)}")
            logger.error(traceback.format_exc())
            print(f"Fatal Error in MCP Server: {str(e)}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    try:
        analyzer = PRAnalyzer()
        analyzer.run()
    except Exception as e:
        logger.error(f"Failed to start MCP server: {str(e)}")
        logger.error(traceback.format_exc())
        sys.exit(1) 