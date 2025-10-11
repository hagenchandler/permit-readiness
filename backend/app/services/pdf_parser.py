import PyPDF2
import re
from typing import Dict, List, Optional

class PDFParser:
    """Service for parsing and validating PDF documents"""
    
    @staticmethod
    def extract_text(file_path: str) -> str:
        """Extract all text from a PDF file"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            print(f"Error extracting text from {file_path}: {e}")
            return ""
    
    @staticmethod
    def get_page_count(file_path: str) -> int:
        """Get the number of pages in a PDF"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                return len(pdf_reader.pages)
        except Exception as e:
            print(f"Error getting page count from {file_path}: {e}")
            return 0
    
    @staticmethod
    def check_keywords(text: str, keywords: List[str], case_sensitive: bool = False) -> Dict[str, bool]:
        """Check if specific keywords exist in the text"""
        results = {}
        search_text = text if case_sensitive else text.lower()
        
        for keyword in keywords:
            search_keyword = keyword if case_sensitive else keyword.lower()
            results[keyword] = search_keyword in search_text
        
        return results
    
    @staticmethod
    def check_signature_present(text: str) -> bool:
        """Check if document appears to have signature-related text"""
        signature_indicators = [
            'signed', 'signature', 'authorized by', 'approved by',
            'digitally signed', 'electronically signed', '/s/'
        ]
        
        text_lower = text.lower()
        return any(indicator in text_lower for indicator in signature_indicators)
    
    @staticmethod
    def check_professional_seal(text: str) -> bool:
        """Check if document mentions professional seals (PE, RA, etc.)"""
        seal_patterns = [
            r'\bP\.?E\.?\b',  # Professional Engineer
            r'\bR\.?A\.?\b',  # Registered Architect
            r'\bP\.?E\.?N\.?G\.?\b',  # Professional Engineer
            r'professional engineer',
            r'registered architect',
            r'licensed engineer',
            r'license no',
            r'registration no',
            r'stamp'
        ]
        
        text_lower = text.lower()
        for pattern in seal_patterns:
            if re.search(pattern, text_lower):
                return True
        return False
    
    @staticmethod
    def validate_document(file_path: str, validation_rules: Dict) -> Dict:
        """
        Validate a PDF document against a set of rules
        
        validation_rules format:
        {
            'minPages': 1,
            'requiredKeywords': ['keyword1', 'keyword2'],
            'mustContainSignature': True,
            'mustBeProfessionallySealed': True
        }
        """
        results = {
            'valid': True,
            'errors': [],
            'warnings': [],
            'details': {}
        }
        
        # Extract text
        text = PDFParser.extract_text(file_path)
        if not text:
            results['valid'] = False
            results['errors'].append('Could not extract text from PDF')
            return results
        
        results['details']['text_extracted'] = True
        results['details']['character_count'] = len(text)
        
        # Check page count
        page_count = PDFParser.get_page_count(file_path)
        results['details']['page_count'] = page_count
        
        if 'minPages' in validation_rules:
            min_pages = validation_rules['minPages']
            if page_count < min_pages:
                results['valid'] = False
                results['errors'].append(f'Document has {page_count} pages, minimum required is {min_pages}')
        
        # Check required keywords
        if 'requiredKeywords' in validation_rules:
            keywords = validation_rules['requiredKeywords']
            keyword_results = PDFParser.check_keywords(text, keywords)
            results['details']['keywords'] = keyword_results
            
            missing_keywords = [kw for kw, found in keyword_results.items() if not found]
            if missing_keywords:
                results['valid'] = False
                results['errors'].append(f'Missing required keywords: {", ".join(missing_keywords)}')
        
        # Check for signature
        if validation_rules.get('mustContainSignature', False):
            has_signature = PDFParser.check_signature_present(text)
            results['details']['has_signature'] = has_signature
            
            if not has_signature:
                results['warnings'].append('No signature indicators found in document')
        
        # Check for professional seal
        if validation_rules.get('mustBeProfessionallySealed', False):
            has_seal = PDFParser.check_professional_seal(text)
            results['details']['has_professional_seal'] = has_seal
            
            if not has_seal:
                results['warnings'].append('No professional seal indicators found in document')
        
        return results
    
    @staticmethod
    def get_document_summary(file_path: str) -> Dict:
        """Get a summary of document contents"""
        text = PDFParser.extract_text(file_path)
        page_count = PDFParser.get_page_count(file_path)
        
        return {
            'page_count': page_count,
            'character_count': len(text),
            'word_count': len(text.split()),
            'has_signature': PDFParser.check_signature_present(text),
            'has_professional_seal': PDFParser.check_professional_seal(text),
            'preview': text[:500] if text else ''  # First 500 characters
        }
